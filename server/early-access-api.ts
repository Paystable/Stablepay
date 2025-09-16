import { Request, Response } from 'express';
import { z } from 'zod';

// Early Access Form Schema
const EarlyAccessFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  formType: z.enum(['savings', 'investment'], {
    errorMap: () => ({ message: 'Form type must be either savings or investment' })
  }),
  walletAddress: z.string().optional(),
  // Financial fields
  monthlyRemittance: z.number().min(0).optional(),
  investmentAmount: z.number().min(0).optional(),
  currentService: z.string().optional(),
  lockPeriod: z.string().optional(),
  riskTolerance: z.string().optional(),
  primaryGoal: z.string().optional(),
  referralSource: z.string().optional(),
  // Calculations
  calculations: z.object({
    monthlyAmount: z.number().min(0),
    totalSavings5Years: z.number().min(0),
    totalYield5Years: z.number().min(0),
    apy: z.number().min(0),
    // Additional calculation fields
    annualSavings: z.number().min(0).optional(),
    monthlySavings: z.number().min(0).optional(),
    projectedYield: z.number().min(0).optional(),
    annualYield: z.number().min(0).optional(),
    combinedBenefit: z.number().min(0).optional()
  }).optional(),
  submittedAt: z.date(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
});

type EarlyAccessRecord = z.infer<typeof EarlyAccessFormSchema> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

// In-memory storage for early access submissions
const earlyAccessSubmissions: EarlyAccessRecord[] = [];

// Create early access submission
export async function createEarlyAccessSubmission(req: Request, res: Response) {
  try {
    // Validate request body
    const validatedData = EarlyAccessFormSchema.parse({
      ...req.body,
      submittedAt: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
    });

    // Check if email already exists
    const existingSubmission = earlyAccessSubmissions.find(sub => sub.email === validatedData.email);
    
    if (existingSubmission) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered for early access',
        data: {
          email: validatedData.email,
          submittedAt: existingSubmission.submittedAt
        }
      });
    }

    // Create new submission
    const submission: EarlyAccessRecord = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    earlyAccessSubmissions.push(submission);

    console.log('✅ Early access submission created:', {
      id: submission.id,
      email: validatedData.email,
      formType: validatedData.formType,
      fullName: validatedData.fullName
    });

    res.status(201).json({
      success: true,
      message: 'Early access request submitted successfully',
      data: {
        id: submission.id,
        email: validatedData.email,
        formType: validatedData.formType,
        submittedAt: submission.submittedAt
      }
    });

  } catch (error) {
    console.error('❌ Error creating early access submission:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}

// Get all early access submissions (admin endpoint)
export async function getEarlyAccessSubmissions(req: Request, res: Response) {
  try {
    const { page = 1, limit = 50, formType, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    let filteredSubmissions = [...earlyAccessSubmissions];

    // Filter by form type if specified
    if (formType) {
      filteredSubmissions = filteredSubmissions.filter(sub => sub.formType === formType);
    }

    // Sort submissions
    filteredSubmissions.sort((a, b) => {
      const aValue = a[sortBy as string];
      const bValue = b[sortBy as string];
      
      if (sortOrder === 'desc') {
        return new Date(bValue).getTime() - new Date(aValue).getTime();
      } else {
        return new Date(aValue).getTime() - new Date(bValue).getTime();
      }
    });

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const submissions = filteredSubmissions.slice(skip, skip + Number(limit));
    const total = filteredSubmissions.length;

    res.json({
      success: true,
      data: {
        submissions: submissions.map(sub => ({
          id: sub.id,
          fullName: sub.fullName,
          email: sub.email,
          phoneNumber: sub.phoneNumber,
          formType: sub.formType,
          walletAddress: sub.walletAddress,
          // Financial fields
          monthlyRemittance: sub.monthlyRemittance,
          investmentAmount: sub.investmentAmount,
          currentService: sub.currentService,
          lockPeriod: sub.lockPeriod,
          riskTolerance: sub.riskTolerance,
          primaryGoal: sub.primaryGoal,
          referralSource: sub.referralSource,
          // Calculations
          calculations: sub.calculations,
          submittedAt: sub.submittedAt,
          ipAddress: sub.ipAddress
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching early access submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}

// Get submission statistics
export async function getEarlyAccessStats(req: Request, res: Response) {
  try {
    const totalSubmissions = earlyAccessSubmissions.length;
    const savingsSubmissions = earlyAccessSubmissions.filter(sub => sub.formType === 'savings').length;
    const investmentSubmissions = earlyAccessSubmissions.filter(sub => sub.formType === 'investment').length;
    
    // Recent submissions (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSubmissions = earlyAccessSubmissions.filter(sub => 
      new Date(sub.submittedAt) >= oneDayAgo
    ).length;

    // Calculate total savings and returns
    const totalCalculatedSavings = earlyAccessSubmissions
      .filter(sub => sub.calculations?.totalSavings5Years)
      .reduce((sum, sub) => sum + (sub.calculations.totalSavings5Years || 0), 0);

    const totalCalculatedReturns = earlyAccessSubmissions
      .filter(sub => sub.calculations?.totalYield5Years)
      .reduce((sum, sub) => sum + (sub.calculations.totalYield5Years || 0), 0);

    const stats = {
      totalSubmissions,
      formTypeBreakdown: {
        savings: savingsSubmissions,
        investment: investmentSubmissions
      },
      recentSubmissions,
      totalCalculatedSavings,
      totalCalculatedReturns
    };

    res.json({
      success: true,
      data: {
        ...stats,
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Error fetching early access stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}

// Update submission (for admin use)
export async function updateEarlyAccessSubmission(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const submissionIndex = earlyAccessSubmissions.findIndex(sub => sub.id === id);

    if (submissionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Update the submission
    earlyAccessSubmissions[submissionIndex] = {
      ...earlyAccessSubmissions[submissionIndex],
      ...updateData,
      updatedAt: new Date()
    };

    res.json({
      success: true,
      message: 'Submission updated successfully',
      data: { id, updated: true }
    });

  } catch (error) {
    console.error('❌ Error updating early access submission:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}

// Delete submission (for admin use)
export async function deleteEarlyAccessSubmission(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const submissionIndex = earlyAccessSubmissions.findIndex(sub => sub.id === id);

    if (submissionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Remove the submission
    earlyAccessSubmissions.splice(submissionIndex, 1);

    res.json({
      success: true,
      message: 'Submission deleted successfully',
      data: { id, deleted: true }
    });

  } catch (error) {
    console.error('❌ Error deleting early access submission:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}
