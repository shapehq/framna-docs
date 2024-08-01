import {
  Box,
  Typography,
} from "@mui/material"
import NewProjectForm from "./NewProjectForm"
import { splitOwnerAndRepository } from "@/common"
import Link from "next/link"

interface NewProjectStepsProps {
  repositoryNameSuffix: string
  templateName?: string
  ownerRepository?: string
  helpURL?: string
}

type StepType = {
  id?: string,
  content: string,
  highlight: string,
  helpURL?: string
}

const NewProjectSteps = ({
  repositoryNameSuffix,
  templateName,
  ownerRepository,
  helpURL,
}: NewProjectStepsProps) => {
  const steps: StepType[] = [
    {
      id: "create-new-repository",
      content: `Create a new repository using our ${templateName ? splitOwnerAndRepository(templateName)?.repository : ""} template`,
      highlight: `${templateName ? splitOwnerAndRepository(templateName)?.repository : ""}`,
      helpURL: helpURL ? `${helpURL}/Adding-Documentation-to-Shape-Docs#create-a-repository` : undefined
    },
    {
      content: "Add OpenAPI specification",
      highlight: "OpenAPI",
      helpURL: helpURL ? `${helpURL}/Adding-Documentation-to-Shape-Docs#add-an-openapi-specification` : undefined
    },
    {
      content: "Customize Your Project",
      highlight: "Customize",
      helpURL: helpURL ? `${helpURL}/Adding-Documentation-to-Shape-Docs#customize-the-project` : undefined

    },
    {
      content: "Ready to start!",
      highlight: "",
    }
  ]

  const isCreateRepositoryStep = (step: StepType) => step.id && step.id === steps[0].id

  const getStepContent = (step: StepType, index: number) => (
    <Box display="flex" flexDirection="row" alignItems="center" gap={2}>
      <Typography sx={{
        display: { xs: "none", sm: "none", md: "flex" },
        fontSize: 20
      }}>
        {`${index + 1}. `}
        {step.content}
      </Typography>
      {step.helpURL && <Link
          style={{ 
            fontSize: 14,
            color: "gray"
          }}
          aria-label="help"
          href={step.helpURL}
          target="_blank" 
          rel="noopener noreferrer"  
        >
          (?)
        </Link>}
    </Box>
  )

return (
    <Box display="flex" alignItems="start" justifyContent="center" flexDirection="column" gap={4}>
        {steps.map((step: StepType, index: number) => 
          <>
            {isCreateRepositoryStep(step) ? 
              <Box display="flex" flexDirection="column" gap={2}>
                  {getStepContent(step, index)}
                <NewProjectForm
                  repositoryNameSuffix={repositoryNameSuffix}
                  templateName={templateName}
                  ownerRepository={ownerRepository}
                />
              </Box> :
              getStepContent(step, index)
            }
          </>
        )}
    </Box>
  )}

export default NewProjectSteps