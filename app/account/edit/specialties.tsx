import { createFieldScreen } from "~/lib/screens/FieldScreenFactory";

export default createFieldScreen({
  title: "Trade specialties",
  columnKey: "specialty",
  type: "multi",
  options: ["Builder", "Electrician", "Plumber", "Carpenter", "Landscaper", "Painter", "Roofer", "Tiler", "Handyman", "Other"],
});
