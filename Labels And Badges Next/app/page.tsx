import dynamic from "next/dynamic";

const App = dynamic(() => import("@/components/App"), {
  ssr: false,
  loading: () => <div className="h-screen w-screen bg-slate-100" />,
});

export default function Page() {
  return <App />;
}
