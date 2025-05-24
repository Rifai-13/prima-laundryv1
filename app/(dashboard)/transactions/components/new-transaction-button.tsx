// components/new-transaction-button.tsx
"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NewTransactionButton() {
  return (
    <Button asChild>
      <Link href="/transactions/new">
        <Plus className="h-4 w-4 mr-2" />
        New Transaction
      </Link>
    </Button>
  )
}