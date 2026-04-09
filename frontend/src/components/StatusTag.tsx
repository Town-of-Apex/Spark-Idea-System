export default function StatusTag({ status }: { status: string }) {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-slate-100 text-slate-600";
      case "reviewing":
        return "bg-blue-50 text-blue-600";
      case "in progress":
        return "bg-teal/10 text-teal";
      case "on roadmap":
        return "bg-gold/10 text-gold";
      case "implemented":
        return "bg-forest/20 text-forest";
      case "already exists":
        return "bg-slate-100 text-rosy";
      default:
        return "bg-slate-100 text-rosy";
    }
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-md tracking-wide ${getStatusStyles()}`}>
      {status}
    </span>
  );
}
