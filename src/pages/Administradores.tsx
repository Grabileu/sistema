import React from 'react'
import type { LoggedUser } from '../App';
import Usuarios from './Usuarios';
type AdministradoresProps = {
  loggedUser: LoggedUser | null;
  setLoggedUser: (user: LoggedUser) => void;
}

const Administradores: React.FC<AdministradoresProps> = ({ loggedUser, setLoggedUser }) => (
	<Usuarios mode="administradores" loggedUser={loggedUser} setLoggedUser={setLoggedUser} />
)

export default Administradores
