import { exec } from 'node:child_process'

export default async function () {
  // Put clean up logic here (e.g. stopping services, docker-compose, etc.).
  // Hint: `globalThis` is shared between setup and teardown.
  console.log(globalThis.__TEARDOWN_MESSAGE__)
  return new Promise<void>((resolve, reject) => {
    exec('docker stop $(docker ps -q)', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error stopping Docker containers: ${error.message}`)
        reject(error)
      } else if (stderr) {
        console.error(`Error output: ${stderr}`)
        reject(new Error(stderr))
      } else {
        console.log(`Stopped Docker containers: ${stdout}`)
        resolve()
      }
    })
  })
}
