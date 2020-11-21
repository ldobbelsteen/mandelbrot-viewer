export default (threadCount) => {
  const queue = []
  const pool = []

  // Populate the pool with workers
  for (let i = 0; i < threadCount; i++) {
    const worker = new Worker('./worker.js')
    worker.busy = false
    pool.push(worker)
  }

  // Execute next job in queue
  const nextJob = () => {
    const worker = pool.find(worker => !worker.busy)
    if (worker === undefined) return

    const job = queue.pop()
    if (job === undefined) return

    worker.busy = true
    worker.onmessage = (event) => {
      worker.busy = false
      job.callback(event)
      nextJob()
    }

    worker.postMessage(job.message, job.transferables)
  }

  // Return function to add a job to the queue
  return {
    addJob: (message, transferables, callback) => {
      queue.push({ message, transferables, callback })
      nextJob()
    }
  }
}
