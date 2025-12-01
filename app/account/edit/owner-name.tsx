import { createFieldScreen } from "./FieldScreenFactory";

export default createFieldScreen({
  title: "Owner / contact name",
  columnKey: "owner_name",
  type: "text",
  placeholder: "Owner name",
});
