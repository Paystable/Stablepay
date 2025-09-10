import { Request, Response } from 'express';
import { getMongoDB } from './mongodb.js';
import { EarlyAccessFormSchema, type EarlyAccessRecord } from './early-access-schema.js';
import { z } from 'zod';

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

    // Get MongoDB connection
    const db = await getMongoDB();
    
    if (!db) {
      throw new Error('Database connection not available');
    }

    const collection = db.collection<EarlyAccessRecord>('early_access_submissions');

    // Check if email already exists
    const existingSubmission = await collection.findOne({ 
      email: validatedData.email 
    });

    if (existingSubmission) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered for early access',
        data: {
          email: validatedData.email,
          submittedAt: existingSubmission.createdAt
        }
      });
    }

    // Create new submission
    const submission: EarlyAccessRecord = {
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(submission);

    console.log('✅ Early access submission created:', {
      id: result.insertedId,
      email: validatedData.email,
      formType: validatedData.formType,
      fullName: validatedData.fullName
    });

    res.status(201).json({
      success: true,
      message: 'Early access request submitted successfully',
      data: {
        id: result.insertedId,
        email: validatedData.email,
        formType: validatedData.formType,
        submittedAt: submission.createdAt
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
    const db = await getMongoDB();
    
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    const collection = db.collection<EarlyAccessRecord>('early_access_submissions');

    const { page = 1, limit = 50, formType, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const filter: any = {};
    if (formType) {
      filter.formType = formType;
    }

    const [submissions, total] = await Promise.all([
      collection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .toArray(),
      collection.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        submissions: submissions.map(sub => ({
          id: sub._id,
          fullName: sub.fullName,
          email: sub.email,
          phoneNumber: sub.phoneNumber,
          formType: sub.formType,
          walletAddress: sub.walletAddress,
          calculations: sub.calculations,
          submittedAt: sub.createdAt,
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
    const db = await getMongoDB();
    
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    const collection = db.collection<EarlyAccessRecord>('early_access_submissions');

    const [
      totalSubmissions,
      savingsSubmissions,
      investmentSubmissions,
      recentSubmissions,
      totalCalculatedSavings,
      totalCalculatedReturns
    ] = await Promise.all([
      collection.countDocuments(),
      collection.countDocuments({ formType: 'savings' }),
      collection.countDocuments({ formType: 'investment' }),
      collection.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }),
      collection.aggregate([
        { $match: { 'calculations.totalSavings5Years': { $exists: true } } },
        { $group: { _id: null, total: { $sum: '$calculations.totalSavings5Years' } } }
      ]).toArray(),
      collection.aggregate([
        { $match: { 'calculations.totalYield5Years': { $exists: true } } },
        { $group: { _id: null, total: { $sum: '$calculations.totalYield5Years' } } }
      ]).toArray()
    ]);

    res.json({
      success: true,
      data: {
        totalSubmissions,
        formTypeBreakdown: {
          savings: savingsSubmissions,
          investment: investmentSubmissions
        },
        recentSubmissions,
        totalCalculatedSavings: totalCalculatedSavings[0]?.total || 0,
        totalCalculatedReturns: totalCalculatedReturns[0]?.total || 0,
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

    const db = await getMongoDB();
    const collection = db.collection<EarlyAccessRecord>('early_access_submissions');

    const result = await collection.updateOne(
      { _id: id },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Submission updated successfully',
      data: { id, updated: result.modifiedCount > 0 }
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

    const db = await getMongoDB();
    const collection = db.collection<EarlyAccessRecord>('early_access_submissions');

    const result = await collection.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

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
