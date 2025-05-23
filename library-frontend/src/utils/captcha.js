// src/utils/captcha.js
import $ from 'jquery';

let cd = '';

export function CreateCaptcha() {
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
  cd = Array.from({ length: 6 }, () => alpha[Math.floor(Math.random() * alpha.length)]).join(' ');
  $('#CaptchaImageCode').html('<canvas id="CapCode" class="capcode" width="300" height="80"></canvas>');
  const c = document.getElementById('CapCode');
  if (!c) return;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.font = '48px Arial';
  ctx.fillStyle = '#2563eb';
  ctx.textAlign = 'center';
  ctx.fillText(cd, c.width / 2, 55);
}

export function ValidateCaptcha() {
  const input = ($('#UserCaptchaCode').val() || '').replace(/\s/g, '');
  return input === cd.replace(/\s/g, '');
}

export function CheckCaptcha() {
  if (!$('#UserCaptchaCode').val()) {
    $('#WrongCaptchaError').text('Veuillez entrer le code').show();
  } else if (!ValidateCaptcha()) {
    $('#WrongCaptchaError').text('Captcha invalide').show();
    CreateCaptcha();
  } else {
    $('#WrongCaptchaError').hide();
    $('#SuccessMessage').text('✅ Captcha validé').show().fadeOut(3000);
  }
}
