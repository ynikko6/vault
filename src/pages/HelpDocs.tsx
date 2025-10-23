import React from "react"
import { HelpCircleIcon, ExternalLinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function HelpDocs() {
  const openDocs = () => {
    // If you have a hosted docs site, update the URL below.
    const url = "https://shadcn.dev" // placeholder doc link
    window.open(url, "_blank")
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <HelpCircleIcon className="w-5 h-5" /> Get Help / Docs
        </h2>
        <Button variant="outline" onClick={openDocs}>
          <ExternalLinkIcon className="w-4 h-4 mr-2" /> Open Docs
        </Button>
      </div>

      <div className="rounded-md border p-4 space-y-3">
        <h3 className="font-medium">Quick Tips</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          <li>Use the sidebar to navigate Vault sections.</li>
          <li>Drag and drop files into My Vault to upload.</li>
          <li>Mark items as favorites to find them faster.</li>
          <li>Workspaces help organize projects and teams.</li>
        </ul>
      </div>

      <Separator />

      <div className="rounded-md border p-4 space-y-3">
        <h3 className="font-medium">FAQ</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p><span className="font-medium text-foreground">How do I restore items from Trash?</span> Open Trash and choose Restore on the item.</p>
          <p><span className="font-medium text-foreground">Can I share files?</span> Yes, use Shared with Me and Workspaces to collaborate.</p>
          <p><span className="font-medium text-foreground">How do I switch themes?</span> Use the toggle in the header or the Settings page.</p>
        </div>
      </div>
    </div>
  )
}