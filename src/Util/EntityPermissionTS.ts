import {check, Permission, request, RESULTS} from 'react-native-permissions';
import {from, map, Observable, of, switchMap} from 'rxjs';

namespace EntityPermissionTS {
  export function getPermissionDevice(
    typePermission: Permission | string,
  ): Observable<boolean> {
    return from(check(<Permission>typePermission)).pipe(
      switchMap(status =>
        status === RESULTS.DENIED
          ? request(<Permission>typePermission)
          : of(status),
      ),
      map(
        granted => granted === RESULTS.GRANTED || granted === RESULTS.LIMITED,
      ),
      // catchError(err => {
      //   console.log('eaf: ', err);
      //   return of(err.status);
      // }),
    );
  }
}

export default EntityPermissionTS;
