"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "./button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center shadow-2xl shadow-rose-500/20 border border-rose-500/20">
              <AlertTriangle className="text-rose-500" size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">System Node Failure</h2>
              <p className="text-sm font-medium text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                An isolated component error has occurred. The workbench remains active.
              </p>
            </div>
            <Button 
              onClick={() => this.setState({ hasError: false })}
              className="bg-primary-accent text-white h-12 px-8 rounded-lg text-sm font-medium shadow-md"
            >
              <RefreshCcw className="mr-2 w-3.5 h-3.5" />
              Reboot Node
            </Button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
