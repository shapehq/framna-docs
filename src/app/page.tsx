import UserComponent from "@/lib/components/UserComponent";
import ProjectListComponent from "@/lib/components/ProjectListComponent";
import App from "@/lib/pages/App";
import WelcomePage from "@/lib/pages/WelcomePage";
import { projectRepository, userProvider } from "./startup";

export default async function Page() {
  const user = await userProvider.getUser();
  return (
    <App
      userComponent={<UserComponent user={user} />}
      projectListComponent={
        <ProjectListComponent projectRepository={projectRepository} />
      }
    >
      <WelcomePage />
    </App>
  );
}
