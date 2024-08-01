"use client"

import {
  TextField,
  Box,
  OutlinedInput,
  InputAdornment,
  Tooltip,
  Button,
} from "@mui/material"
import LockIcon from '@mui/icons-material/Lock'
import { useState } from 'react'
import { makeFullRepositoryName } from "@/common/utils/makeFullRepositoryName"
import { makeNewGitHubRepositoryLink } from "@/common/utils/makeNewGitHubRepositoryLink"
import Link from "next/link"

interface NewProjectFormProps {
  repositoryNameSuffix: string
  templateName?: string
  ownerRepository?: string
}

const NewProjectForm = ({
  repositoryNameSuffix,
  templateName,
  ownerRepository
}: NewProjectFormProps) => {
  const [projectName, setProjectName] = useState("")

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
    <Box display="flex" flexDirection="column" gap={2} width={550}>
      <Box display="flex" flexDirection="row" gap={2}>
        <Tooltip title="If is another one, change it on next step">
          <TextField
            disabled
            id="owner-repository"
            value={ownerRepository || ""}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <LockIcon />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            sx={{ width: 300 }}
          />
        </Tooltip>
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
          onChange={(e) => setProjectName(e.target.value)}
          fullWidth
          sx={{ paddingLeft: 2 }}
        />
      </Box>
      <Button
        disabled={projectName.length == 0}
        type="button"
        component={Link}
        href={newGitHubRepositoryLink}
        target="_blank" 
        rel="noopener noreferrer"
        variant="contained"
        color="primary"
        size="large"
        sx={{ width: 1, height: 56 }}
      >
        Create Repository
      </Button>
    </Box>
  )}

export default NewProjectForm