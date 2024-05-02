import { Themable } from '@/theme-provider/types';

export default function ThumbsDownIcon({ theme }: Themable) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="35" viewBox="0 0 34 35" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23.5798 15.9102C23.8749 16.2866 24.0165 16.6901 23.9985 17.1057C23.9804 17.5635 23.7757 17.9219 23.607 18.1417C23.8027 18.6297 23.878 19.3976 23.2245 19.9939C22.7456 20.4307 21.9325 20.6264 20.806 20.5723C20.014 20.5361 19.3513 20.3885 19.3243 20.3824H19.3213C19.1708 20.3554 19.011 20.3223 18.8484 20.2861C18.8363 20.4789 18.8696 20.9577 19.2249 22.0359C19.6465 23.3189 19.6225 24.3008 19.1466 24.9572C18.6466 25.6469 17.8485 25.7012 17.6135 25.7012C17.3877 25.7012 17.1799 25.6078 17.0324 25.4362C16.6981 25.0477 16.7373 24.3309 16.7793 23.9996C16.3818 22.9334 15.2676 20.3192 14.3248 19.5935C14.3067 19.5814 14.2917 19.5663 14.2767 19.5513C13.9995 19.2591 13.8129 18.9429 13.6864 18.6658C13.5086 18.7622 13.3069 18.8164 13.0899 18.8164H11.2529C10.5601 18.8164 10 18.2532 10 17.5635V12.6695C10 11.9768 10.5632 11.4166 11.2529 11.4166H13.0899C13.358 11.4166 13.608 11.501 13.8129 11.6455L14.5205 11.5611C14.629 11.5461 16.5565 11.3021 18.5352 11.3413C18.8935 11.3142 19.2309 11.2992 19.5441 11.2992C20.0832 11.2992 20.5531 11.3413 20.9445 11.4257C21.8661 11.6214 22.4957 12.0128 22.8148 12.5882C23.0588 13.0278 23.0588 13.4646 23.0197 13.7416C23.6191 14.2837 23.7244 14.8831 23.7033 15.3047C23.6913 15.5487 23.637 15.7565 23.5798 15.9102ZM11.2529 12.2298C11.009 12.2298 10.8132 12.4286 10.8132 12.6695V17.5666C10.8132 17.8104 11.0119 18.0063 11.2529 18.0063H13.0899C13.3339 18.0063 13.5298 17.8075 13.5298 17.5666V12.6726C13.5298 12.4286 13.331 12.2327 13.0899 12.2327H11.2529V12.2298ZM22.8088 16.2625C22.6823 16.13 22.6582 15.9281 22.7547 15.7715C22.7547 15.7685 22.878 15.5577 22.8932 15.2685C22.9142 14.874 22.7245 14.5247 22.327 14.2265C22.1854 14.1181 22.1282 13.9313 22.1885 13.7627C22.1885 13.7597 22.3179 13.3621 22.1072 12.9856C21.9052 12.6243 21.4566 12.3654 20.7759 12.2208C20.2309 12.1033 19.4898 12.0821 18.5805 12.1545H18.5383C16.6016 12.1123 14.644 12.3654 14.623 12.3683H14.6199L14.3158 12.4045C14.3339 12.4887 14.3429 12.5792 14.3429 12.6695V17.5666C14.3429 17.696 14.3219 17.8225 14.2857 17.94C14.3399 18.1417 14.4905 18.5905 14.8458 18.973C16.1982 20.0452 17.5203 23.6622 17.5775 23.8188C17.6017 23.8821 17.6075 23.9514 17.5956 24.0206C17.5443 24.3579 17.5624 24.7706 17.6347 24.894C17.7943 24.891 18.225 24.8459 18.484 24.4875C18.7912 24.0628 18.7791 23.3038 18.4478 22.298C17.9419 20.7649 17.8997 19.9579 18.3003 19.6024C18.4991 19.4248 18.7641 19.4157 18.9569 19.4849C19.1406 19.5272 19.3153 19.5633 19.4809 19.5904C19.4929 19.5935 19.508 19.5964 19.52 19.5995C20.4447 19.8013 22.1011 19.9247 22.6763 19.4007C23.1642 18.955 22.8179 18.3647 22.7788 18.3014C22.6673 18.1328 22.7004 17.9129 22.851 17.7773C22.854 17.7744 23.1702 17.4762 23.1852 17.0756C23.1973 16.8076 23.0708 16.5335 22.8088 16.2625Z"
        fill={theme.aiChat.icons.color}
      />
    </svg>
  );
}
