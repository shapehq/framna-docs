"use client"

import {
  Box,
  OutlinedInput,
  InputAdornment,
  Button,
  FormHelperText,
} from "@mui/material"
import { useState } from 'react'
import { makeFullRepositoryName } from "@/common/utils/makeFullRepositoryName"
import { makeNewGitHubRepositoryLink } from "@/common/utils/makeNewGitHubRepositoryLink"
import Link from "next/link"
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown'

interface NewProjectFormProps {
  repositoryNameSuffix: string
  templateName?: string
  ownerRepository?: string
}

const validateProjectName = (name: string): boolean => {
  const regex = /^[a-zA-Z0-9]([a-zA-Z0-9-_]){0,99}$/;
  return regex.test(name);
}

const NewProjectForm = ({
  repositoryNameSuffix,
  templateName,
}: NewProjectFormProps) => {
  const [projectName, setProjectName] = useState("")
  const [isValid, setIsValid] = useState(true)

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProjectName(value);
    setIsValid(validateProjectName(value));
  }

  const suffixedRepositoryName = makeFullRepositoryName({
    name: projectName,
    suffix: repositoryNameSuffix
  })
  const newGitHubRepositoryLink = makeNewGitHubRepositoryLink({
    templateName,
    repositoryName: suffixedRepositoryName,
    description: `Contains OpenAPI specifications for ${projectName}`
  })

return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      gap={2}
      sx={{ width: { xs: 1, sm: 1, md: 1 } }}
    >
      <OutlinedInput
        id="project-name"
        endAdornment={
          <InputAdornment position="end" sx={{ marginRight: 2 }}>
            {repositoryNameSuffix}
          </InputAdornment>
        }
        aria-describedby="repository-namet"
        inputProps={{
          'aria-label': 'repository-name',
        }}
        placeholder="project-name"
        value={projectName}
        onChange={handleProjectNameChange}
        error={!isValid && projectName.length > 0}
        sx={{ paddingLeft: 2, width: 1 }}
      />
      <Box
        display="flex"
        flexDirection="column"
        gap={2}
      >
        {!isValid && projectName.length > 0 && (
          <FormHelperText
            error
            id="repository-name-helper"
            sx={{ width: 1, height: 60, margin: 0 }}>
            - Project name must start with an alphanumeric character.
            <br/>
            - Can only contain hyphens and non-alphanumeric character.
            <br/>
            - Length must be between 1 and 100 characters.
          </FormHelperText>
        )}
        <Button
          id="create-repository"
          disabled={projectName.length == 0 || !isValid}
          type="button"
          component={Link}
          href={newGitHubRepositoryLink}
          target="_blank" 
          rel="noopener noreferrer"
          variant="contained"
          color="primary"
          size="large"
          sx={{ height: 56, width: 1 }}
        >
          Create Repository
        </Button>
        {(isValid || projectName.length == 0 ) && (
          <Box
            width={1}
            height={60}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <KeyboardDoubleArrowDownIcon color="disabled" sx={{ marginTop: 2 }} />
          </Box>
        )}
      </Box>
    </Box>
  )}

export default NewProjectForm