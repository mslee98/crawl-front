import Lottie from "lottie-react";
import Button from "../ui/button/Button";
import dashboardAnimation from "../../lotties/Animated Dashboards.json";

interface DanggeunIntroProps {
  onStart: () => void;
}

export default function DanggeunIntro({ onStart }: DanggeunIntroProps) {
  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center">
        <h3 className="text-center mb-5 text-xl font-semibold text-gray-800 dark:text-white/90 lg:mb-7 lg:text-2xl leading-relaxed">
          <span className="text-[#4660FF] font-bold">중고 시세</span>부터
          <span className="text-[#4660FF] font-bold"> 지역 트렌드</span>까지
          <br />
          <span className="text-[#4660FF] font-bold">자비스 하나로</span> 관리하세요.
        </h3>
        <div className="w-full max-w-md">
          <Lottie animationData={dashboardAnimation} loop />
        </div>
      </div>

      <Button variant="primary" className="mt-6 w-full" onClick={onStart}>
        시작하기
      </Button>
    </>
  );
}
