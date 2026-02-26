import json
import uuid

def modify_workflow_v2():
    with open('current_workflow.json', 'r') as f:
        workflows = json.load(f)

    # In export --id, it returns an array of 1 workflow object directly, or a list containing it.
    # The saved file from previous step (verify.json) showed it as a list `[{...}]`.
    # Let's handle both.
    if isinstance(workflows, list):
        target_workflow = workflows[0]
    else:
        target_workflow = workflows

    nodes = target_workflow['nodes']
    connections = target_workflow['connections']

    # Identify Nodes
    # 1. HTTP Request (Generator) - ID: 03768e80-4189-4a2f-b374-ebac75c8a805
    # 2. Download Theme Zip - I need to find its ID. It was generated randomly last time.
    #    I'll find it by name or type + position.
    
    generator_node_id = '03768e80-4189-4a2f-b374-ebac75c8a805'
    download_node = next((n for n in nodes if n['name'] == 'Download Theme Zip'), None)
    
    if not download_node:
        print("Download node not found!")
        # Fallback if I can't find it by name?
        # Maybe look for the second HTTP request?
        # But I just added it. It should be there.
        return

    download_node_id = download_node['id']

    # 1. ADD RETRY to Download Node
    # "Set the 'Download Theme Zip' node to Retry on Failure (2 attempts, 5s interval)"
    download_node['retryOnFail'] = True
    download_node['maxTries'] = 2
    download_node['waitBetweenTries'] = 5000 # ms
    
    # 2. INSERT WAIT NODE
    wait_node_id = str(uuid.uuid4())
    wait_node = {
        "parameters": {
            "amount": 2,
            "unit": "seconds"
        },
        "id": wait_node_id,
        "name": "Wait for FS",
        "type": "n8n-nodes-base.wait",
        "typeVersion": 1,
        "position": [150, -64] # In between 32 (Generator) and 250 (Download)
    }
    
    nodes.append(wait_node)
    
    # 3. UPDATE CONNECTIONS
    # Old: Generator -> Download
    # New: Generator -> Wait -> Download
    
    # Remove old connection from Generator
    if 'HTTP Request' in connections:
        # Check if it connects to Download
        main_outputs = connections['HTTP Request']['main']
        # Filter out the connection to Download Node
        new_main_outputs = []
        for output_group in main_outputs:
            new_group = [link for link in output_group if link['node'] != 'Download Theme Zip']
            if new_group:
                new_main_outputs.append(new_group)
            else:
                # If the group is empty now, we might need to keep the structure or empty it?
                # n8n structure is main: [ [ {node, ...}, {node, ...} ] ] (index 0 output)
                # If we remove the only link, we should clear it or point to Wait.
                pass
        
        # Actually, let's just RESET the connections for these specific nodes to be sure.
        connections['HTTP Request']['main'] = [[
            {
                "node": "Wait for FS",
                "type": "main",
                "index": 0
            }
        ]]
    
    # Connect Wait -> Download
    connections['Wait for FS'] = {
        "main": [[
            {
                "node": "Download Theme Zip",
                "type": "main",
                "index": 0
            }
        ]]
    }
    
    # Ensure Download Node doesn't have incoming connections from Generator anymore (handled above by overwriting 'HTTP Request')
    
    target_workflow['nodes'] = nodes
    target_workflow['connections'] = connections
    
    # Wrap back in list if it was a list
    output_json = [target_workflow] if isinstance(workflows, list) else target_workflow

    with open('workflows_v2.json', 'w') as f:
        json.dump(output_json, f, indent=2)

if __name__ == '__main__':
    modify_workflow_v2()
