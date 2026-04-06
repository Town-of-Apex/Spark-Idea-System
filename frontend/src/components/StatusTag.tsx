export default function StatusTag({ status }: { status: string }) {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-slate-100 text-slate-600";
      case "reviewing":
        return "bg-blue-50 text-blue-600";
      case "in progress":
        return "bg-cool-insight/10 text-cool-insight";
      case "on roadmap":
        return "bg-warm-signal/10 text-warm-signal";
      case "implemented":
        return "bg-soft-success/20 text-[#2F6F5E]"; // using apex green for text on success
      case "already exists":
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full tracking-wide ${getStatusStyles()}`}>
      {status}
    </span>
  );
}
