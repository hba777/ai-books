from fastapi import APIRouter, Depends, HTTPException, status, Body
from models.agent_configs import AgentConfigModel
from utils.jwt_utils import get_user_from_cookie
from db.mongo import get_agent_configs_collection, kb_data_collection
from bson import ObjectId
from pydantic import BaseModel
from .schemas import AgentConfigResponse, AgentConfigListResponse, AgentDeleteResponse, TestAgentRequest
from utils.agent_logger import log_previous_agent_data

router = APIRouter(prefix="/agents", tags=["Agent Configurations"])

@router.get(
    "/",
    response_model=AgentConfigListResponse,
    dependencies=[Depends(get_user_from_cookie)]
)
def get_all_agents():
    collection = get_agent_configs_collection()
    agents = list(collection.find())
    for agent in agents:
        agent["_id"] = str(agent["_id"])
        # Convert knowledge_base items if they exist
        if "knowledge_base" in agent and agent["knowledge_base"]:
            for kb_item in agent["knowledge_base"]:
                if "_id" in kb_item:
                    kb_item["_id"] = str(kb_item["_id"])
    return AgentConfigListResponse(agents=[AgentConfigResponse(**agent) for agent in agents])

@router.post(
    "/",
    response_model=AgentConfigResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_user_from_cookie)]
)
def create_agent(agent: AgentConfigModel):
    collection = get_agent_configs_collection()
    agent_dict = agent.dict(by_alias=True, exclude_none=True)
    if "_id" in agent_dict:
        del agent_dict["_id"]
    
    # Handle knowledge_base items - create them in kb_data_collection
    if "knowledge_base" in agent_dict and agent_dict["knowledge_base"]:
        created_kb_items = []
        for kb_item in agent_dict["knowledge_base"]:
            # Remove _id if present for new creation
            if "_id" in kb_item:
                del kb_item["_id"]
            
            # Insert into kb_data_collection
            kb_result = kb_data_collection.insert_one(kb_item)
            kb_item["_id"] = str(kb_result.inserted_id)
            created_kb_items.append(kb_item)
        
        # Update agent_dict with the created knowledge base items
        agent_dict["knowledge_base"] = created_kb_items
    
    result = collection.insert_one(agent_dict)
    agent_dict["_id"] = str(result.inserted_id)
    
    return AgentConfigResponse(**agent_dict)

@router.put(
    "/{agent_id}",
    response_model=AgentConfigResponse,
    dependencies=[Depends(get_user_from_cookie)]
)
def update_agent(agent_id: str, agent: AgentConfigModel):
    collection = get_agent_configs_collection()

    # Convert incoming data to dict (excluding id fields)
    update_data = agent.dict(by_alias=True, exclude={"id", "_id"})

    # Fetch existing agent to compare KB items if needed
    existing_agent = collection.find_one({"_id": ObjectId(agent_id)})
    if not existing_agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    #Store agent data in log
    log_previous_agent_data(existing_agent, agent_id)

    # Only perform KB operations if type is NOT 'classification'
    if agent.type != "classification":
        existing_kb_ids = {
            str(item["_id"]) for item in existing_agent.get("knowledge_base", [])
        }

        new_kb_items = update_data.get("knowledge_base", [])

        # Collect IDs from new KB items (those being updated)
        new_kb_ids = {item["_id"] for item in new_kb_items if "_id" in item}

        # --- DELETE removed KB items ---
        kb_ids_to_delete = existing_kb_ids - new_kb_ids
        for kb_id in kb_ids_to_delete:
            kb_data_collection.delete_one({"_id": ObjectId(kb_id)})

        # --- CREATE / UPDATE KB items ---
        updated_kb_items = []
        for kb_item in new_kb_items:
            kb_item_copy = kb_item.copy()

            if "_id" in kb_item_copy:
                # Update existing KB
                kb_id = kb_item_copy["_id"]
                del kb_item_copy["_id"]

                kb_data_collection.find_one_and_update(
                    {"_id": ObjectId(kb_id)},
                    {"$set": kb_item_copy},
                    return_document=True
                )
                kb_item_copy["_id"] = kb_id
            else:
                # Create new KB
                kb_result = kb_data_collection.insert_one(kb_item_copy)
                kb_item_copy["_id"] = str(kb_result.inserted_id)

            updated_kb_items.append(kb_item_copy)

        # Set updated KB list in update data
        update_data["knowledge_base"] = updated_kb_items
    else:
        # If type is classification, remove knowledge_base from update_data
        update_data.pop("knowledge_base", None)

    # Update the agent document
    result = collection.find_one_and_update(
        {"_id": ObjectId(agent_id)},
        {"$set": update_data},
        return_document=True
    )

    result["_id"] = str(result["_id"])
    return AgentConfigResponse(**result)

@router.post(
    "/{agent_id}/test",
    dependencies=[Depends(get_user_from_cookie)]
)
def test_agent(agent_id: str, request: TestAgentRequest):
    collection = get_agent_configs_collection()
    
    # Check if agent exists
    agent = collection.find_one({"_id": ObjectId(agent_id)})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # TODO: Implement actual agent testing logic here
    # This is a placeholder that returns the agent info and the test text
    return {
        "message": "Agent test completed",
        "agent_id": agent_id,
        "agent_name": agent.get("agent_name", "Unknown"),
        "test_text": request.text,
        "result": "Placeholder result - implement actual agent testing logic"
    }

@router.delete(
    "/all",
    response_model=AgentDeleteResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_user_from_cookie)]
)
def delete_all_agents():
    collection = get_agent_configs_collection()

    # Fetch all agents
    agents = collection.find()
    deleted_agent_ids = []

    for agent in agents:
        # Delete associated knowledge base items
        if "knowledge_base" in agent and agent["knowledge_base"]:
            for kb_item in agent["knowledge_base"]:
                if "_id" in kb_item:
                    kb_data_collection.delete_one({"_id": ObjectId(kb_item["_id"])})

        # Delete the agent itself
        collection.delete_one({"_id": agent["_id"]})
        deleted_agent_ids.append(str(agent["_id"]))

    if not deleted_agent_ids:
        raise HTTPException(status_code=404, detail="No agents found to delete")

    return AgentDeleteResponse(
        detail=f"Deleted {len(deleted_agent_ids)} agents successfully",
        agent_id=",".join(deleted_agent_ids)  # or list of IDs if preferred
    )


@router.delete(
    "/{agent_id}",
    response_model=AgentDeleteResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_user_from_cookie)]
)
def delete_agent(agent_id: str):
    collection = get_agent_configs_collection()
    
    # Get the agent first to find its knowledge base items
    agent = collection.find_one({"_id": ObjectId(agent_id)})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Delete associated knowledge base items
    if "knowledge_base" in agent and agent["knowledge_base"]:
        for kb_item in agent["knowledge_base"]:
            if "_id" in kb_item:
                kb_data_collection.delete_one({"_id": ObjectId(kb_item["_id"])})
    
    # Delete the agent
    collection.delete_one({"_id": ObjectId(agent_id)})
    return AgentDeleteResponse(detail="Agent deleted successfully", agent_id=agent_id)

@router.patch(
    "/{agent_id}",
    response_model=AgentConfigResponse,
    dependencies=[Depends(get_user_from_cookie)]
)
def power_off_agent(agent_id: str, status: bool = Body(..., embed=True)):
    collection = get_agent_configs_collection()
    new_status = not status
    result = collection.find_one_and_update(
        {"_id": ObjectId(agent_id)},
        {"$set": {"status": new_status}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    result["_id"] = str(result["_id"])
    
    # Convert knowledge_base _id fields to strings for response
    if "knowledge_base" in result and result["knowledge_base"]:
        for kb_item in result["knowledge_base"]:
            if "_id" in kb_item:
                kb_item["_id"] = str(kb_item["_id"])
    
    return AgentConfigResponse(**result)