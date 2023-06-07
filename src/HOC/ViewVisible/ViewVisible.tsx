import React, {useMemo} from 'react';

interface ViewVisibleProps {
  condition?: boolean;
  children?: React.ReactNode;
}

const ViewVisible = ({condition = false, children}: ViewVisibleProps) => {
  return useMemo(
    () => (condition ? <>{children}</> : null),
    [children, condition],
  );
};

export default ViewVisible;