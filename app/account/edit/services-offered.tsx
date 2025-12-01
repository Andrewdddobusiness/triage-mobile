import { createFieldScreen } from "~/lib/screens/FieldScreenFactory";

export default createFieldScreen({
  title: "Services offered",
  columnKey: "services_offered",
  type: "multi",
  options: ["New Builds", "Renovations", "Repairs", "Installations", "Emergency Call-Outs", "Inspections", "Custom Work", "Other"],
});
