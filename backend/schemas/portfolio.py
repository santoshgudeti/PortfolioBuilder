from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel


class ProjectItem(BaseModel):
    title: str = ""
    description: str = ""
    tech: List[str] = []
    url: Optional[str] = None
    github: Optional[str] = None


class ExperienceItem(BaseModel):
    company: str = ""
    role: str = ""
    duration: str = ""
    description: str = ""


class EducationItem(BaseModel):
    institution: str = ""
    degree: str = ""
    year: str = ""


class ParsedResumeData(BaseModel):
    name: str = ""
    title: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    summary: str = ""
    tagline: str = ""
    skills: List[str] = []
    projects: List[ProjectItem] = []
    experience: List[ExperienceItem] = []
    education: List[EducationItem] = []
    github: Optional[str] = None
    linkedin: Optional[str] = None
    website: Optional[str] = None


class PortfolioCreate(BaseModel):
    parsed_data: ParsedResumeData
    theme: str = "minimal"
    primary_color: str = "#6366f1"


class PortfolioUpdate(BaseModel):
    parsed_data: Optional[ParsedResumeData] = None
    theme: Optional[str] = None
    primary_color: Optional[str] = None
    is_published: Optional[bool] = None
    hidden_sections: Optional[str] = None


class PortfolioOut(BaseModel):
    id: str
    user_id: str
    slug: str
    parsed_data: str  # JSON string
    theme: str
    primary_color: str
    is_published: bool
    resume_filename: Optional[str]
    view_count: int = 0
    hidden_sections: str = ""
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

