import {
  Sparkles,
  FileText,
  ShieldCheck,
  FlaskConical,
  LineChart,
  Scan,
  Stethoscope,
  Code,
  MessageCircle,
  AlertCircle,
  HelpCircle,
  Settings,
  MoreHorizontal,
} from "lucide-react";

// Map icon names (strings) to lucide-react components
const iconMap = {
  Sparkles,
  FileText,
  ShieldCheck,
  FlaskConical,
  LineChart,
  Scan,
  Stethoscope,
  Code,
  Chat: MessageCircle,
  AlertCircle,
  HelpCircle,
  Settings,
  MoreHorizontal,
};

/**
 * Dynamic Icon Component
 * Maps icon name strings to actual lucide-react components
 * Supports custom className for sizing and styling
 */
export const DynamicIcon = ({ iconName, className = "w-6 h-6" }) => {
  const Icon = iconMap[iconName] || AlertCircle;
  return <Icon className={className} />;
};

export default DynamicIcon;
