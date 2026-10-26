import { Link } from "react-router-dom";
import Header from "../components/Header";
import Navigation from "../components/Navigation";

export default function HistoryPage() {
  return (
    <>
      <Header />
      <Navigation />
      {/* back to dashboard */}

      <div className="min-h-screen bg-[#fbf6ee] py-10 px-4 relative">
        <button
          type="button"
          className="text-stone-600 hover:text-stone-900 font-medium text-sm transition-colors mb-6 absolute top-4 left-10"
        >
          <Link to="/"> Back to Home</Link>
        </button>
        <div className="max-w-3xl mx-auto bg-white border border-stone-200 rounded-xl p-6 md:p-8 shadow-sm mt-6">
          <h1 className="text-2xl md:text-3xl font-serif text-stone-800">
            రాయి లాగుడు పందాల చరిత్ర
          </h1>

          <p className="mt-4 text-stone-700 leading-relaxed">
            Rock pulling and bullock cart traditions grew from village strength,
            teamwork, and farming culture. These contests were part of local
            festivals, where families and teams showed discipline, training, and
            pride. Over time, the sport became an identity of rural celebration,
            especially during Sankranthi seasons in many regions.
          </p>

          <p className="mt-3 text-stone-700 leading-relaxed">
            Today, these events continue as a cultural symbol - honoring the
            bond between people, bulls, and community heritage...
          </p>
          <p className="mt-3 text-stone-700 leading-relaxed">
            {" "}
            Coming soon with more details and stories from the heart of our
            villages!
          </p>
        </div>
      </div>
    </>
  );
}
