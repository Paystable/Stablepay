
import Navigation from "../components/navigation";
import SendReceiveUSDC from "../components/send-receive-usdc";

export default function P2PPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navigation />
      <div className="py-4 bg-[#FAF9F6] min-h-screen">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-4">
              P2P USDC Transfer
            </h1>
            <p className="text-lg text-[#6667AB] mb-2">
              Send and receive USDC directly with other users on the Base network
            </p>
          </div>
          
          {/* Ensure SendReceiveUSDC component is properly rendered */}
          <div className="w-full">
            <SendReceiveUSDC />
          </div>
        </div>
      </div>
    </div>
  );
}
