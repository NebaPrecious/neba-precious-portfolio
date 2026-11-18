import CategoryManager from "@/components/admin/CategoryManager";
import SkillsEditor from "@/components/admin/SkillsEditor";
import { listCategories, listSkillsByCategory } from "@/server/dal/admin";

/** Session-gated admin page: allowed to block on navigation. */
export const instant = false;

export const metadata = { title: "Skills" };

export default async function AdminSkillsPage() {
  const [groups, categories] = await Promise.all([listSkillsByCategory(), listCategories("skill")]);

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Skills &amp; tools</h1>
          <p>
            Grouped lists shown on the home and about pages. No proficiency percentages — add a short note like
            “Learning” where it helps.
          </p>
        </div>
      </div>

      <div className="admin-grid-2">
        <SkillsEditor groups={groups} />
        <CategoryManager scope="skill" categories={categories} title="Skill groups" unit="skills" />
      </div>
    </>
  );
}
