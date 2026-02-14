import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { DanggeunIntro, DanggeunLocation } from "../../components/Danggeun";

export default function Danggeun() {
  const [started, setStarted] = useState(false);

  return (
    <>
      <PageMeta
        title="당근마켓 | JAVAIS"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="당근마켓" />
      <div className="flex min-h-[calc(100vh-12rem)] w-full flex-col rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        {started ? (
          <DanggeunLocation />
        ) : (
          <DanggeunIntro onStart={() => setStarted(true)} />
        )}
      </div>
    </>
  );
}
