
from .prompt import PromptDBModel
from typing import Optional, Dict, List
from datetime import datetime

class User:
    userID : str = ""
    name : str = ""  
    surname : str = ""
    username : str = ""
    createdAt : datetime = datetime.now()
    last50Prompts : List[PromptDBModel] = []  # list of promptIDs
    email : str = ""
    profileImageURL : Optional[str] = None
    projectIDs : List[Dict[str, str]] = []  # list of {projectID, projectName} dictionaries

    def __init__(self, **data):
        for key, value in data.items():
            setattr(self, key, value)
    

    def to_firestore_dict(self) -> dict:
        data = {
            "userID": self.userID,
            "name": self.name,
            "surname": self.surname,
            "username": self.username,
            "createdAt": self.createdAt,
            "last50Prompts": [prompt.promptID for prompt in self.last50Prompts],
            "email": self.email,
            "profileImageURL": self.profileImageURL,
            "projectIDs": self.projectIDs
        }
        return data

