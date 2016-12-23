import express from 'express';
import {login} from './views';

export const userRoutes = express.Router({
  caseSensitive: true,
  strict: true
});

userRoutes.get('/login/', login);