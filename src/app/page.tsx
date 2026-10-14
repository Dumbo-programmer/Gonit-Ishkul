import { HeroBanner } from "@/components/HeroBanner";
import { HomeSections } from "@/components/HomeSections";
import { listCourses } from "@/lib/repositories/courses";
import { listProblems } from "@/lib/repositories/problems";
import { listUsers } from "@/lib/repositories/users";
import { coverageByDistrict } from "@/lib/repositories/ambassador";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const stats = {
    learners: listUsers().length,
    courses: listCourses().length,
    problems: listProblems().length,
    districts: coverageByDistrict().size,
  };

  return (
    <>
      <HeroBanner stats={stats} />
      <HomeSections />
    </>
  );
}
