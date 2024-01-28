import sys
import base64
import docker 

def main():
    decoded_string = base64.b64decode(sys.argv[1]).decode('utf-8')
    print(decoded_string)

    client = docker.from_env()
    container = client.containers.run(image='ollama/ollama', volumes=['ollama:/root/.ollama'],ports = {'11434/tcp':11434}, name='ollama', detach=True)
    _, out = container.exec_run('ollama run mistral "'+decoded_string+'"', stdout=True, stderr=True, stdin=False)
    print(out.decode())
    container.stop()
    client.containers.prune()
    
if __name__ == '__main__':
    main()