import Sliderbar from "./Sliderbar";
import Topbar from "./Topbar";
import MobileNav from "./MobileNav";

export default function AppLayout({
  children,
  activePath = "/dashboard",
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="flex min-h-screen">

        <Sliderbar activePath={activePath} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />

          <main className="min-h-0 flex-1 overflow-x-hidden pb-20 lg:pb-0">
            {children}
          </main>
        </div>

      </div>

      <MobileNav activePath={activePath} />
    </div>
  );
}