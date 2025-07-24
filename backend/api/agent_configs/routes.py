from fastapi import APIRouter, Depends, HTTPException, status
from models.agent_configs import AgentConfigModel
from utils.jwt_utils import get_user_from_cookie
from db.mongo import get_agent_configs_collection
from bson import ObjectId

from .schemas import AgentConfigResponse, AgentConfigListResponse, AgentDeleteResponse

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
    return AgentConfigListResponse(agents=[AgentConfigResponse(**agent) for agent in agents])

@router.post(
    "/",
    response_model=AgentConfigResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_user_from_cookie)]
)
def create_agent(agent: AgentConfigModel):
    collection = get_agent_configs_collection()
    agent_dict = agent.dict(by_alias=True, exclude={"_id"})
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
    update_data = agent.dict(by_alias=True, exclude={"_id"})
    result = collection.find_one_and_update(
        {"_id": ObjectId(agent_id)},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Agent not found")
    result["_id"] = str(result["_id"])
    return AgentConfigResponse(**result)

@router.delete(
    "/{agent_id}",
    response_model=AgentDeleteResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_user_from_cookie)]
)
def delete_agent(agent_id: str):
    collection = get_agent_configs_collection()
    result = collection.delete_one({"_id": ObjectId(agent_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Agent not found")
    return AgentDeleteResponse(detail="Agent deleted successfully", agent_id=agent_id)