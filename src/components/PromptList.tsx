import React, { useContext, useMemo, useState } from 'react';
import {
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { usePrompts } from '@/hooks';
import { UserContext } from '@/userContext';
import { Prompt } from '@/types';

export const PromptList = () => {
  const userContext = useContext(UserContext);
  const { prompts } = usePrompts();
  const [filter, setFilter] = useState<'myPrompts' | 'allPrompts'>('myPrompts');
  const sortedPrompts = useMemo(() => {
    const filteredPrompts = prompts?.filter(
      (p) => filter === 'allPrompts' || p.user.id === userContext.userId,
    );

    filteredPrompts?.sort((a, b) => {
      return (
        (b.createdAt?.toDate().getTime() ?? 0) -
        (a.createdAt?.toDate().getTime() ?? 0)
      );
    });

    return filteredPrompts;
  }, [prompts, filter]);

  const getOutputDisplay = (prompt: Prompt): JSX.Element => {
    console.log(prompt.output);
    return (
      <>
        {prompt.output?.map((output) => {
          return (
            <>
              {prompt.mimeType === 'video/mp4' ? (
                <video
                  loop
                  controls
                  src={output}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              ) : (
                <img
                  alt={`${prompt.input.prompt}` ?? 'Prompt'}
                  src={output ?? ''}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              )}
            </>
          );
        })}
      </>
    );
  };

  return (
    <Grid
      container
      alignItems="center"
      justifyContent="center"
      direction="column"
      gap={4}
    >
      <FormControl>
        <InputLabel id="demo-simple-select-label">Filter</InputLabel>
        <Select
          labelId="filter-select-label"
          id="filter-select"
          value={filter}
          label="Filter"
          onChange={(e) => setFilter(e.target.value as any)}
        >
          <MenuItem value="myPrompts">My Prompts</MenuItem>
          <MenuItem value="allPrompts">All Prompts</MenuItem>
        </Select>
      </FormControl>
      <Grid item>
        <Grid container gap={2} alignItems="flex-start" justifyContent="center">
          {sortedPrompts?.map((prompt) => {
            return (
              <Grid
                item
                key={prompt.id}
                sx={{
                  width: 256,
                }}
              >
                <Grid container alignItems="center" direction="column">
                  {prompt.status === 'done' && !prompt.error ? (
                    getOutputDisplay(prompt)
                  ) : (
                    <Grid
                      style={{
                        width: '100%',
                        height: 256,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'black',
                      }}
                    >
                      {prompt.error ? (
                        <Typography variant="caption">
                          Error {prompt.error}
                        </Typography>
                      ) : (
                        <CircularProgress />
                      )}
                    </Grid>
                  )}
                  <Typography
                    textAlign="center"
                    variant="caption"
                    gutterBottom={true}
                  >
                    {prompt.input?.prompt}
                  </Typography>
                </Grid>
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    </Grid>
  );
};
