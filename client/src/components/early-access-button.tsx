import { Button } from "@/components/ui/button";
import { 
  Star
} from "lucide-react";
import { Link } from "wouter";

export default function EarlyAccessButton() {
  return (
    <Link href="/early-access">
      <Button
        className="w-full bg-[#6667AB] hover:bg-[#6667AB]/90 text-white font-semibold py-4 px-8 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 border-0"
      >
        <Star className="w-5 h-5 mr-3" />
        Get Early Access
      </Button>
    </Link>
  );
}
