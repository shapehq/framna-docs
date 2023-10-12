import { ProjectRepository } from '@/lib/projects/ProjectRepository'
import { UserProviding } from '@/lib/auth/UserProviding'

interface FrontpageProps {
  userProvider: UserProviding
  projectRepository: ProjectRepository
}

export default async function Frontpage(props: FrontpageProps) {
  const user = await props.userProvider.getUser()
  const projects = await props.projectRepository.getProjects()
  return (
    <div>
      <img src={user.avatarURL} alt={user.name} width={50} />
      <h2>Hi {user.name} 👋👋</h2>
      <p><a href="/api/auth/logout">Log out</a></p>
      <p><strong>Projects:</strong></p>
      <ul>
        {projects.map((e, index) => (
         <li key={index}>{e.name}</li> 
        ))}
      </ul>
    </div>
  )
}
