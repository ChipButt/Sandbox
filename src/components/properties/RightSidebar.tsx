import { LayersPanel } from "../layers/LayersPanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { PresetsPanel } from "./PresetsPanel";

export function RightSidebar() {
  return (
    <div className="thin-scrollbar h-full overflow-y-auto">
      <PropertiesPanel />
      <LayersPanel />
      <PresetsPanel />
    </div>
  );
}
