"use client"
import {
  Box,
  Typography,
} from "@mui/material"
import NewProjectForm from "./NewProjectForm"
import { splitOwnerAndRepository } from "@/common"
import HighlightText from "@/common/ui/HighlightText"
import { BASE_COLORS } from "@/common/theme/theme"
import { Fragment } from "react"

interface NewProjectStepsProps {
  repositoryNameSuffix: string
  templateName?: string
  ownerRepository?: string
}

type StepType = {
  id?: string,
  content: string,
  highlight: string,
}

const NewProjectSteps = ({
  repositoryNameSuffix,
  templateName,
  ownerRepository,
}: NewProjectStepsProps) => {
  const steps: StepType[] = [
    {
      id: "create-new-repository",
      content: `Create a new repository using our ${templateName ? splitOwnerAndRepository(templateName)?.repository : ""} template`,
      highlight: "Create a new repository",
    },
    {
      content: "Add OpenAPI specification",
      highlight: "Add OpenAPI",
    },
    {
      content: "Customize Your Project",
      highlight: "Customize",

    },
    {
      content: "Ready to start!",
      highlight: "",
    }
  ]

  const isCreateRepositoryStep = (step: StepType) => step.id && step.id === steps[0].id

  const getStepContent = (step: StepType, index: number) => (
    <>
      {step.highlight ? 
        <HighlightText
          content={`${index + 1}. ${step.content}`}
          highlight={step.highlight}
          color={BASE_COLORS[2]}
          height="80%"
          sx={{ fontSize: 20, marginRight: { xs: 1 } }}
          isBoldText
        /> :
        <Typography sx={{
          display: { md: "flex" },
          fontSize: 20,
          marginRight: { xs: 4 }
        }}>
          {`${index + 1}. `}
          {step.content}
        </Typography>
      }
    </>
  )

return (
    <Box display="flex" alignItems="start" justifyContent="center" flexDirection="column" gap={4}>
        {steps.map((step: StepType, index: number) => 
          <Fragment key={`box-step-${index}`}>
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
          </Fragment>
        )}
    </Box>
  )}

export default NewProjectSteps