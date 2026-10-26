export default function PageState({ type }) {
  if (type === "loading") {
    return (
      <div className="min-h-screen bg-[#fbf6ee] flex justify-center items-center">
        <div className="bg-white rounded-xl p-12 text-center border border-stone-200 shadow-sm">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full mb-4"></div>
          <p className="text-stone-500 font-medium">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (type === "not-found") {
    return (
      <div className="min-h-screen bg-[#fbf6ee] flex justify-center items-center">
        <div className="text-red-600 font-medium">Event not found</div>
      </div>
    );
  }

  return null;
}
