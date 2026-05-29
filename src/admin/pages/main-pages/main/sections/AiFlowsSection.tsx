import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useDashboardDataStore } from "@/store/dashboard/dashboardDataStore";
import { Workflow, Plus, GitBranch } from "lucide-react"
import { useNavigate } from "react-router";

export const AiFlowsSection = () => {

    const navigate = useNavigate();

    const { aiFlows } = useDashboardDataStore();

    return (
        <Card className="lg:col-span-2 border-border/50 overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Active AI Flows</h3>
                </div>

                <Button onClick={() => navigate("/dashboard/flows")} size="sm" className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    New Flow
                </Button>
            </div>

            <div className="divide-y divide-border/50">
                {aiFlows.length > 0 ? (
                    aiFlows.map((flow) => (
                        <div
                            key={flow.id}
                            className="flex items-center justify-between border-b border-border/50 px-4 py-4 last:border-0"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                                    <GitBranch className="h-4 w-4 text-primary" />
                                </div>

                                <div>
                                    <p className="font-semibold">{flow.name}</p>

                                    <p className="text-sm text-muted-foreground">
                                        {flow.nodes_count} nodes · {flow.runs_count.toLocaleString()} runs
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="font-semibold text-emerald-400">
                                    {Number(flow.conversion_rate)}%
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    conversion
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                        <GitBranch className="mb-3 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium">No active AI flows yet</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Active AI workflows will appear here once created.
                        </p>
                    </div>
                )}
            </div>
        </Card>
    )
}
