import React, { useContext, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { usePrompts, useUser } from '@/hooks';
import { UserContext } from '@/userContext';
import { ArrowForwardIosRounded, ExpandMore } from '@mui/icons-material';
import ModelConfig from '@/../models.json';
import { PromptParameters } from './PromptParameters';

const Models = ModelConfig.Models;

export const PromptText = () => {
  const userContext = useContext(UserContext);
  const { addPrompt } = usePrompts();
  const { user } = useUser(userContext);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<string>(Models[0].key);

  const currentModel = Models.find((m) => m.key === model);

  const [additionalParams, setAdditionalParams] = useState<Record<string, any>>(
    currentModel?.defaults ?? {},
  );

  const onParametersChanded = (params: Record<string, any>) => {
    setAdditionalParams(params);
  };

  const submitPrompt = async () => {
    if (!user?.ref) {
      return;
    }
    addPrompt({
      model,
      input: {
        prompt,
        ...additionalParams,
      },
      user: user.ref,
    });
    setPrompt('');
  };

  const promptInputs = useMemo(() => {
    return (
      <PromptParameters
        model={currentModel?.id ?? ''}
        onParametersChanded={onParametersChanded}
        fields={currentModel?.defaults ?? {}}
      />
    );
  }, [currentModel, onParametersChanded]);

  return (
    <Grid
      container
      alignItems="center"
      direction="column"
      gap={4}
      sx={{ marginBottom: '4em' }}
    >
      <Typography textAlign="center" variant="h4" gutterBottom={true}>
        Enter your prompt
      </Typography>
      <FormControl>
        <InputLabel id="demo-simple-select-label">Model</InputLabel>
        <Select
          labelId="model-select-label"
          id="model-select"
          value={model}
          label="Model"
          onChange={(e) => setModel(e.target.value as any)}
        >
          {Models.map((model) => (
            <MenuItem key={model.key} value={model.key}>
              {model.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth={true}
        multiline={true}
        value={prompt}
        type="text"
        label="Prompt"
        onChange={(event) => setPrompt(event.target.value)}
        size="small"
      />
      <Accordion sx={{ width: '100%' }}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="advanced-parameters-content"
          id="advanced-parameters-header"
        >
          <Typography>Advanced</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container alignItems="center" direction="column" gap={4}>
            {promptInputs}
          </Grid>
        </AccordionDetails>
      </Accordion>
      <LoadingButton
        onClick={() => {
          submitPrompt();
        }}
        disabled={!user}
        variant="contained"
        endIcon={<ArrowForwardIosRounded />}
      >
        Submit
      </LoadingButton>
    </Grid>
  );
};
