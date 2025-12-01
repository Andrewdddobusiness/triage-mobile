import { createFieldScreen } from "./FieldScreenFactory";

export default createFieldScreen({
  title: "Business name",
  columnKey: "business_name",
  type: "text",
  placeholder: "Business name",
});
