
import json
import sys
import os

FILE_PATH = 'workflows_v2.json'
NODE_ID_TO_REMOVE = 'c1eedb9b-3aa1-498e-b58b-f1c64fbb7a71'

def main():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        sys.exit(1)

    with open(FILE_PATH, 'r') as f:
        data = json.load(f)

    # Workflows are array or object? View showed array of 1 object.
    if isinstance(data, list):
        workflow = data[0]
    else:
        workflow = data

    nodes = workflow.get('nodes', [])
    initial_count = len(nodes)
    
    # Filter out the node
    new_nodes = [n for n in nodes if n.get('id') != NODE_ID_TO_REMOVE]
    
    if len(new_nodes) == initial_count:
        print(f"Node {NODE_ID_TO_REMOVE} not found.")
    else:
        print(f"Removed node {NODE_ID_TO_REMOVE}. Count: {initial_count} -> {len(new_nodes)}")
        workflow['nodes'] = new_nodes
        
        with open(FILE_PATH, 'w') as f:
            json.dump(data, f, indent=2)

if __name__ == '__main__':
    main()
