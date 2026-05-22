"use client";

import { useState } from "react";
import { User, LogOut, AlertCircle, ExternalLink, Droplets } from "lucide-react";
import { useWallet } from "@/lib/genlayer/wallet";
import { success, error, userRejected } from "@/lib/utils/toast";
import { AddressDisplay } from "./AddressDisplay";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { getContractAddress } from "@/lib/genlayer/client";

const METAMASK_INSTALL_URL = "https://metamask.io/download/";

export function AccountPanel() {
  const {
    address,
    isConnected,
    isMetaMaskInstalled,
    isOnCorrectNetwork,
    isLoading,
    connectWallet,
    disconnectWallet,
    switchWalletAccount,
  } = useWallet();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const hasContract = Boolean(getContractAddress());

  const handleConnect = async () => {
    if (!isMetaMaskInstalled) return;
    try {
      setIsConnecting(true);
      setConnectionError("");
      await connectWallet();
      setIsModalOpen(false);
      success("Wallet connected");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect";
      setConnectionError(msg);
      if (!msg.includes("rejected")) {
        error("Connection failed", { description: msg });
      } else {
        userRejected("Đã hủy kết nối");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsModalOpen(false);
  };

  const handleSwitchAccount = async () => {
    try {
      setIsSwitching(true);
      setConnectionError("");
      await switchWalletAccount();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("rejected")) {
        setConnectionError(msg);
        error("Failed to switch account", { description: msg });
      }
    } finally {
      setIsSwitching(false);
    }
  };

  if (!isConnected) {
    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button variant="gradient" disabled={isLoading}>
            <User className="w-4 h-4 mr-2" />
            Connect wallet
          </Button>
        </DialogTrigger>
        <DialogContent className="brand-card border-2 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-display">
              Connect MetaMask
            </DialogTitle>
            <DialogDescription>
              Studionet · Chain ID 61999 · Token GEN
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {!isMetaMaskInstalled ? (
              <>
                <Alert className="bg-accent/10 border-accent/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>MetaMask not installed</AlertTitle>
                  <AlertDescription>
                    Install MetaMask to send transactions on GenLayer Studionet.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={() => window.open(METAMASK_INSTALL_URL, "_blank")}
                  variant="gradient"
                  className="w-full h-12"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Install MetaMask
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleConnect}
                  variant="gradient"
                  className="w-full h-12"
                  disabled={isConnecting}
                >
                  {isConnecting ? "Connecting..." : "Connect MetaMask"}
                </Button>
                {connectionError && (
                  <Alert variant="destructive">
                    <AlertDescription>{connectionError}</AlertDescription>
                  </Alert>
                )}
                <p className="text-xs text-muted-foreground">
                  Studio will add GenLayer Studionet automatically. Get test GEN via the 💧
                  faucet on studio.genlayer.com.
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <div className="flex items-center gap-2">
        <div className="brand-card px-3 py-2 hidden sm:flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isOnCorrectNetwork ? "bg-green-500" : "bg-amber-500 animate-pulse"
            }`}
          />
          <AddressDisplay address={address} maxLength={10} />
          {hasContract && (
            <span className="text-[10px] text-green-400/80">IC ✓</span>
          )}
        </div>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <User className="w-4 h-4" />
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="brand-card border-2 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Your wallet</DialogTitle>
          <DialogDescription>GenLayer Studionet</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="brand-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Address</p>
            <code className="text-xs break-all">{address}</code>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                isOnCorrectNetwork ? "bg-green-500" : "bg-amber-500"
              }`}
            />
            {isOnCorrectNetwork ? "On GenLayer network" : "Wrong network — switch in MetaMask"}
          </div>
          <Alert className="bg-blue-500/10 border-blue-500/20">
            <Droplets className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-xs">
              Need GEN? Open{" "}
              <a
                href="https://studio.genlayer.com"
                className="text-accent underline"
                target="_blank"
                rel="noreferrer"
              >
                Studio
              </a>{" "}
              → Faucet 💧
            </AlertDescription>
          </Alert>
          <Button variant="outline" className="w-full" onClick={handleSwitchAccount} disabled={isSwitching}>
            Switch account
          </Button>
          <Button variant="outline" className="w-full text-destructive" onClick={handleDisconnect}>
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
