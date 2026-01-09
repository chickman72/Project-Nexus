import * as Icons from "lucide-react";

export function getIconComponent(iconName) {
  return Icons[iconName] ?? Icons.Circle;
}
