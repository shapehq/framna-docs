import { withPageAuthRequired, getSession } from '@auth0/nextjs-auth0'

export default withPageAuthRequired(async function Home() {
  const session = await getSession()
  const user = session?.user
  if (!user) {
    return <div></div>
  }
  return (
    <div>
      <img src={user.picture} alt={user.name} width={50} />
      <h2>Hi {user.name} 👋</h2>
      <p><a href="/api/auth/logout">Log out</a></p>
    </div>
  )
}, { returnTo: '/' })
