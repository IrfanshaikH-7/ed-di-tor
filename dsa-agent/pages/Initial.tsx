import Bottom from "@/components/main/bottom/Bottom";
import Editor from "@/components/main/editor/Editor";
import Right from "@/components/main/right/Right";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Initial() {
    return (
        <ResizablePanelGroup direction="horizontal" className="h-screen p-2 w-screen rounded-lg border">
            {/* Left Panel */}
            <ResizablePanel defaultSize={25} minSize={20} maxSize={25}>
                <div className="flex h-full items-center bg-neutral-800 rounded-2xl justify-center p-4 ">
                    <span className="font-semibold">Left</span>
                </div>
            </ResizablePanel>
            <ResizableHandle />
            {/* Center + Bottom (vertical split) */}
            <ResizablePanel defaultSize={60} minSize={30}>
                <ResizablePanelGroup direction="vertical">
                    {/* Center Panel */}
                    <ResizablePanel className="" defaultSize={70} minSize={20}>
                        <section className="flex items-start h-full rounded-2xl overflow-hidden bg-neutral-800   justify-center">
                            <Editor />
                        </section>
                    </ResizablePanel>
                    <ResizableHandle />
                    {/* Bottom Panel */}
                    <ResizablePanel defaultSize={30} minSize={10}>
                        <section className="flex h-full rounded-2xl bg-neutral-800 items-center justify-center overflow-hidden">
                        <Bottom/>
                        </section>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle />
            {/* Right Panel */}
            <ResizablePanel defaultSize={26} minSize={2} maxSize={30}>
                <div className="flex h-full rounded-2xl bg-neutral-800  items-center justify-center p-1.5">
                    <Right/>
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
