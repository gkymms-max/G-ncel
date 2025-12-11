import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, FileEdit } from "lucide-react";

const statusConfig = {
  draft: {
    label: "Taslak",
    color: "bg-gray-100 text-gray-800",
    icon: FileEdit
  },
  pending: {
    label: "Beklemede",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock
  },
  approved: {
    label: "Onaylandı",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle2
  },
  rejected: {
    label: "Reddedildi",
    color: "bg-red-100 text-red-800",
    icon: XCircle
  }
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;
  
  return (
    <Badge className={`${config.color} flex items-center gap-1 px-2 py-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
