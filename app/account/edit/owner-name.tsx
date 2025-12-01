import { createFieldScreen } from "~/lib/screens/FieldScreenFactory";

export default createFieldScreen({
  title: "Owner / contact name",
  columnKey: "owner_name",
  type: "text",
  placeholder: "Owner name",
});
