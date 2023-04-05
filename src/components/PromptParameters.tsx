import React, { useEffect, useState } from 'react';
import { TextField } from '@mui/material';

export const PromptParameters = ({
  model,
  fields,
  onParametersChanded,
}: {
  model: string;
  fields: Record<string, any>;
  onParametersChanded: (params: Record<string, any>) => void;
}) => {
  const [additionalParams, setAdditionalParams] = useState<Record<string, any>>(
    {},
  );
  useEffect(() => {
    onParametersChanded(additionalParams);
  }, [additionalParams]);
  return (
    <>
      {Object.entries(fields).map(([key, value], i) => {
        if (typeof value === 'undefined') {
          return <></>;
        }
        const type = typeof value === 'string' ? 'text' : 'number';
        return (
          <TextField
            key={`${model}-${key}-${i}`}
            fullWidth={true}
            value={additionalParams[key]}
            defaultValue={value}
            type={type}
            label={key}
            onChange={(event) =>
              setAdditionalParams({
                ...additionalParams,
                [key]:
                  type === 'number'
                    ? Number(event.target.value)
                    : event.target.value,
              })
            }
            size="small"
          />
        );
      })}
    </>
  );
};
