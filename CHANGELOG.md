# Changelog

## [2.1.1](https://github.com/JustinBeckwith/gcbuild/compare/gcbuild-v2.1.0...gcbuild-v2.1.1) (2025-11-20)


### Bug Fixes

* **deps:** update dependency globby to v16 ([#296](https://github.com/JustinBeckwith/gcbuild/issues/296)) ([20c126c](https://github.com/JustinBeckwith/gcbuild/commit/20c126c1fbc45030a6533138f7e98d1cced071d2))
* resolve race condition in CLI unit tests ([#298](https://github.com/JustinBeckwith/gcbuild/issues/298)) ([d723b20](https://github.com/JustinBeckwith/gcbuild/commit/d723b202094d18c89845afcdf418796ee47d2888))

## [2.1.0](https://github.com/JustinBeckwith/gcbuild/compare/gcbuild-v2.0.0...gcbuild-v2.1.0) (2025-10-29)


### Features

* add build options, management methods, and enhanced error handling ([#291](https://github.com/JustinBeckwith/gcbuild/issues/291)) ([815446b](https://github.com/JustinBeckwith/gcbuild/commit/815446be0f7f19126fd04cccfdfe44e2a00f09b2))


### Bug Fixes

* **deps:** update dependency googleapis to v163 ([#287](https://github.com/JustinBeckwith/gcbuild/issues/287)) ([afaa930](https://github.com/JustinBeckwith/gcbuild/commit/afaa930fedb45ceb2d0cda6a63ea41b49fb61c93))
* **deps:** update dependency googleapis to v164 ([#289](https://github.com/JustinBeckwith/gcbuild/issues/289)) ([a4f41e0](https://github.com/JustinBeckwith/gcbuild/commit/a4f41e037d9ed01144ca3f6dbf1fc95c6eb209bd))

## [2.0.0](https://github.com/JustinBeckwith/gcbuild/compare/gcbuild-v1.3.39...gcbuild-v2.0.0) (2025-10-14)


### ⚠ BREAKING CHANGES

* This package now requires node 20+
* require node 16 and up ([#182](https://github.com/JustinBeckwith/gcbuild/issues/182))
* This module now requires node.js 12 and up.

### Features

* convert to esm, drop support for node 10 ([#136](https://github.com/JustinBeckwith/gcbuild/issues/136)) ([8919182](https://github.com/JustinBeckwith/gcbuild/commit/891918265e18fa44c5e7628bc4e78b6974260bc1))
* enable object lifecycle on bucket ([#7](https://github.com/JustinBeckwith/gcbuild/issues/7)) ([6ac015c](https://github.com/JustinBeckwith/gcbuild/commit/6ac015c47d1cc4daec8a5c8f40170f14c8adb8f8))
* initial commit ([c5eaec5](https://github.com/JustinBeckwith/gcbuild/commit/c5eaec5740478dd37f1d61e6aafc4a5727555589))
* return build metadata with promise ([#4](https://github.com/JustinBeckwith/gcbuild/issues/4)) ([832a980](https://github.com/JustinBeckwith/gcbuild/commit/832a9803c9090a1bb0ebdff46b58e0bd709c134c))
* support automatic Dockerfile builds ([#25](https://github.com/JustinBeckwith/gcbuild/issues/25)) ([05db3ec](https://github.com/JustinBeckwith/gcbuild/commit/05db3ecc986e59a9e033e6d055fba2b9a1a1529c))


### Bug Fixes

* clean up console output and tests ([#3](https://github.com/JustinBeckwith/gcbuild/issues/3)) ([656b5b6](https://github.com/JustinBeckwith/gcbuild/commit/656b5b614921b27646e761f60325b321ab4952d2))
* **deps:** update dependency chalk to v3 ([#41](https://github.com/JustinBeckwith/gcbuild/issues/41)) ([2500e20](https://github.com/JustinBeckwith/gcbuild/commit/2500e20dce69be1c9ae8f57c4f5ff92094fe338c))
* **deps:** update dependency chalk to v4 ([#58](https://github.com/JustinBeckwith/gcbuild/issues/58)) ([7dde800](https://github.com/JustinBeckwith/gcbuild/commit/7dde800ec5b9b82313791617b2f46a7a5ee4ff7d))
* **deps:** update dependency chalk to v5 ([#137](https://github.com/JustinBeckwith/gcbuild/issues/137)) ([0ca0e8f](https://github.com/JustinBeckwith/gcbuild/commit/0ca0e8f01a66dbb2c8dde958c3ba563a58b9ed1c))
* **deps:** update dependency globby to v10 ([#28](https://github.com/JustinBeckwith/gcbuild/issues/28)) ([fd51e7c](https://github.com/JustinBeckwith/gcbuild/commit/fd51e7c87fde2ad9cf2b42d381aa546dca4b0ef9))
* **deps:** update dependency globby to v11 ([#47](https://github.com/JustinBeckwith/gcbuild/issues/47)) ([e2efcdb](https://github.com/JustinBeckwith/gcbuild/commit/e2efcdbf9c50bccd97221b9931026744747ade1e))
* **deps:** update dependency globby to v13 ([#140](https://github.com/JustinBeckwith/gcbuild/issues/140)) ([e5ce147](https://github.com/JustinBeckwith/gcbuild/commit/e5ce14706f25ac588ca02596c337f620c29f2af4))
* **deps:** update dependency globby to v14 ([#212](https://github.com/JustinBeckwith/gcbuild/issues/212)) ([1c8425f](https://github.com/JustinBeckwith/gcbuild/commit/1c8425f34cc6d5f4c0a7bcf68d71e68e64d4b5db))
* **deps:** update dependency globby to v15 ([#276](https://github.com/JustinBeckwith/gcbuild/issues/276)) ([d7fcef1](https://github.com/JustinBeckwith/gcbuild/commit/d7fcef117b07bd74b2be910d121d91caf34f1dbb))
* **deps:** update dependency google-auth-library to v4 ([#18](https://github.com/JustinBeckwith/gcbuild/issues/18)) ([35a06e4](https://github.com/JustinBeckwith/gcbuild/commit/35a06e4a067e92bd7132dbf2cd458f9ef91c74d2))
* **deps:** update dependency googleapis to v100 ([#151](https://github.com/JustinBeckwith/gcbuild/issues/151)) ([2bbdfff](https://github.com/JustinBeckwith/gcbuild/commit/2bbdfffcbe0fa40e9ad5529c4a21763c74336596))
* **deps:** update dependency googleapis to v101 ([#157](https://github.com/JustinBeckwith/gcbuild/issues/157)) ([f5bae38](https://github.com/JustinBeckwith/gcbuild/commit/f5bae3872e723ea472b8f37cd6e79be5466b2795))
* **deps:** update dependency googleapis to v102 ([#158](https://github.com/JustinBeckwith/gcbuild/issues/158)) ([2a9b81d](https://github.com/JustinBeckwith/gcbuild/commit/2a9b81dadb9ccac68d9ef98d6a0eda5254b3e827))
* **deps:** update dependency googleapis to v103 ([#159](https://github.com/JustinBeckwith/gcbuild/issues/159)) ([a0e586d](https://github.com/JustinBeckwith/gcbuild/commit/a0e586d69b35ea2122ff528ca13cbe6c05ad9aba))
* **deps:** update dependency googleapis to v109 ([#168](https://github.com/JustinBeckwith/gcbuild/issues/168)) ([3cb7fe5](https://github.com/JustinBeckwith/gcbuild/commit/3cb7fe5b6140b5499bf963799caef04ce03d2ccf))
* **deps:** update dependency googleapis to v110 ([#171](https://github.com/JustinBeckwith/gcbuild/issues/171)) ([b44dd21](https://github.com/JustinBeckwith/gcbuild/commit/b44dd210940e559f7732d47ec537ced573a680a6))
* **deps:** update dependency googleapis to v111 ([#173](https://github.com/JustinBeckwith/gcbuild/issues/173)) ([b1e4013](https://github.com/JustinBeckwith/gcbuild/commit/b1e40134a20a2e479e92570e15fc3b0f160a5ee4))
* **deps:** update dependency googleapis to v113 ([#175](https://github.com/JustinBeckwith/gcbuild/issues/175)) ([3fd255f](https://github.com/JustinBeckwith/gcbuild/commit/3fd255f752285fc304f76b7da621ff14f51a2b58))
* **deps:** update dependency googleapis to v114 ([#177](https://github.com/JustinBeckwith/gcbuild/issues/177)) ([7368507](https://github.com/JustinBeckwith/gcbuild/commit/73685079ee3912c4ca4729f3996bac6e4a4cd9f5))
* **deps:** update dependency googleapis to v117 ([#181](https://github.com/JustinBeckwith/gcbuild/issues/181)) ([fda33e9](https://github.com/JustinBeckwith/gcbuild/commit/fda33e9dc0146177259d5be42b67be0e7ab76aab))
* **deps:** update dependency googleapis to v118 ([#183](https://github.com/JustinBeckwith/gcbuild/issues/183)) ([fcb7cab](https://github.com/JustinBeckwith/gcbuild/commit/fcb7cab7436fd271e6d50ab38265bd82e3fcb4f3))
* **deps:** update dependency googleapis to v123 ([#191](https://github.com/JustinBeckwith/gcbuild/issues/191)) ([bd528c6](https://github.com/JustinBeckwith/gcbuild/commit/bd528c6a813335b95031f2aba1492afae1ab26f2))
* **deps:** update dependency googleapis to v125 ([#197](https://github.com/JustinBeckwith/gcbuild/issues/197)) ([b391afa](https://github.com/JustinBeckwith/gcbuild/commit/b391afaf9b44b4f4586842d1f15ed2e6f80e71ca))
* **deps:** update dependency googleapis to v126 ([#198](https://github.com/JustinBeckwith/gcbuild/issues/198)) ([24b5f93](https://github.com/JustinBeckwith/gcbuild/commit/24b5f93e2c5f9d755456c2953f6d2539a46e8bd2))
* **deps:** update dependency googleapis to v128 ([#205](https://github.com/JustinBeckwith/gcbuild/issues/205)) ([07c84c2](https://github.com/JustinBeckwith/gcbuild/commit/07c84c28e29f3168cf9e0c30d2e42469acd4f00c))
* **deps:** update dependency googleapis to v129 ([#214](https://github.com/JustinBeckwith/gcbuild/issues/214)) ([29d4c42](https://github.com/JustinBeckwith/gcbuild/commit/29d4c42c2b464642fceb75a4d26a8d01c5552e40))
* **deps:** update dependency googleapis to v130 ([#218](https://github.com/JustinBeckwith/gcbuild/issues/218)) ([293583b](https://github.com/JustinBeckwith/gcbuild/commit/293583bd0219d1bcab6f2b60786c12cec41de9ee))
* **deps:** update dependency googleapis to v131 ([#220](https://github.com/JustinBeckwith/gcbuild/issues/220)) ([218efcd](https://github.com/JustinBeckwith/gcbuild/commit/218efcdb9ee3b686f579e85e9e4e09a8ecbe4566))
* **deps:** update dependency googleapis to v132 ([#222](https://github.com/JustinBeckwith/gcbuild/issues/222)) ([4fce529](https://github.com/JustinBeckwith/gcbuild/commit/4fce5293cb36c548e3e8caec2a76dba85c0c375a))
* **deps:** update dependency googleapis to v133 ([#224](https://github.com/JustinBeckwith/gcbuild/issues/224)) ([a001154](https://github.com/JustinBeckwith/gcbuild/commit/a00115453f70772fa1acac821591b71f5fe467b0))
* **deps:** update dependency googleapis to v134 ([#226](https://github.com/JustinBeckwith/gcbuild/issues/226)) ([75c964a](https://github.com/JustinBeckwith/gcbuild/commit/75c964a57909f91dba1e1e6c4d217038383b0b5c))
* **deps:** update dependency googleapis to v135 ([#229](https://github.com/JustinBeckwith/gcbuild/issues/229)) ([5c98c84](https://github.com/JustinBeckwith/gcbuild/commit/5c98c849383b0529b349089acfe4d75c9ab8a385))
* **deps:** update dependency googleapis to v136 ([#230](https://github.com/JustinBeckwith/gcbuild/issues/230)) ([77962ee](https://github.com/JustinBeckwith/gcbuild/commit/77962ee7d192bf071e0f1139a3cfea559903a129))
* **deps:** update dependency googleapis to v139 ([#234](https://github.com/JustinBeckwith/gcbuild/issues/234)) ([cf36ac5](https://github.com/JustinBeckwith/gcbuild/commit/cf36ac5cfff694492cf5a72464d451e595758084))
* **deps:** update dependency googleapis to v140 ([#235](https://github.com/JustinBeckwith/gcbuild/issues/235)) ([d580313](https://github.com/JustinBeckwith/gcbuild/commit/d58031345caf31f8805096ab33481e4aced9f3b7))
* **deps:** update dependency googleapis to v142 ([#239](https://github.com/JustinBeckwith/gcbuild/issues/239)) ([b397508](https://github.com/JustinBeckwith/gcbuild/commit/b397508d9b714477a00f8eb3b78f5572a4d0fb48))
* **deps:** update dependency googleapis to v143 ([#241](https://github.com/JustinBeckwith/gcbuild/issues/241)) ([7192f10](https://github.com/JustinBeckwith/gcbuild/commit/7192f10da3c62bf09561964ac8fb7ed72d6e3820))
* **deps:** update dependency googleapis to v144 ([#243](https://github.com/JustinBeckwith/gcbuild/issues/243)) ([d0031ab](https://github.com/JustinBeckwith/gcbuild/commit/d0031ab48401cac999fc089795584d050cfcaee0))
* **deps:** update dependency googleapis to v146 ([#251](https://github.com/JustinBeckwith/gcbuild/issues/251)) ([e9630d0](https://github.com/JustinBeckwith/gcbuild/commit/e9630d0b6f1e0d92d81a91e49bf6021b2085fa7e))
* **deps:** update dependency googleapis to v39 ([#12](https://github.com/JustinBeckwith/gcbuild/issues/12)) ([4ba45f3](https://github.com/JustinBeckwith/gcbuild/commit/4ba45f3260b08b07e56e8624040188c5a041617d))
* **deps:** update dependency googleapis to v40 ([#24](https://github.com/JustinBeckwith/gcbuild/issues/24)) ([dbf0a44](https://github.com/JustinBeckwith/gcbuild/commit/dbf0a44fb34e6d29b6484cc0f532b091af3f5ca2))
* **deps:** update dependency googleapis to v41 ([#29](https://github.com/JustinBeckwith/gcbuild/issues/29)) ([20505c1](https://github.com/JustinBeckwith/gcbuild/commit/20505c14c022f0ea20ca7c932aa04d31104348c4))
* **deps:** update dependency googleapis to v42 ([#30](https://github.com/JustinBeckwith/gcbuild/issues/30)) ([1a2011a](https://github.com/JustinBeckwith/gcbuild/commit/1a2011a972ede35eefdf2474676d7301eb3ff939))
* **deps:** update dependency googleapis to v43 ([#34](https://github.com/JustinBeckwith/gcbuild/issues/34)) ([35073f7](https://github.com/JustinBeckwith/gcbuild/commit/35073f7e2b101c3f66d2bc652b6085e64333881b))
* **deps:** update dependency googleapis to v44 ([#37](https://github.com/JustinBeckwith/gcbuild/issues/37)) ([5dc2e42](https://github.com/JustinBeckwith/gcbuild/commit/5dc2e4241a0d7ba6bafa7a27da22eaefc4f42a8e))
* **deps:** update dependency googleapis to v45 ([#40](https://github.com/JustinBeckwith/gcbuild/issues/40)) ([b839ab7](https://github.com/JustinBeckwith/gcbuild/commit/b839ab78c1fb47017b9229de35f4e2118b940541))
* **deps:** update dependency googleapis to v46 ([#43](https://github.com/JustinBeckwith/gcbuild/issues/43)) ([8b69524](https://github.com/JustinBeckwith/gcbuild/commit/8b6952460b81d9aa5907bcbf009b989faf0fdfdd))
* **deps:** update dependency googleapis to v47 ([#50](https://github.com/JustinBeckwith/gcbuild/issues/50)) ([c502836](https://github.com/JustinBeckwith/gcbuild/commit/c5028369c7f73e9fc70a76fd78143199d3bb1b9e))
* **deps:** update dependency googleapis to v49 ([#63](https://github.com/JustinBeckwith/gcbuild/issues/63)) ([4ef3f9f](https://github.com/JustinBeckwith/gcbuild/commit/4ef3f9fa4632b43ab8c3160a22a3bc8591ce4038))
* **deps:** update dependency googleapis to v50 ([#64](https://github.com/JustinBeckwith/gcbuild/issues/64)) ([19afca3](https://github.com/JustinBeckwith/gcbuild/commit/19afca33400c32bef4b2ada99e79767a5f995677))
* **deps:** update dependency googleapis to v51 ([#67](https://github.com/JustinBeckwith/gcbuild/issues/67)) ([40d2642](https://github.com/JustinBeckwith/gcbuild/commit/40d2642ba7204558e844d0948e74c9cc9083fb0e))
* **deps:** update dependency googleapis to v52 ([#68](https://github.com/JustinBeckwith/gcbuild/issues/68)) ([c678df4](https://github.com/JustinBeckwith/gcbuild/commit/c678df4112c1ad44411225f141cbe040343c57d3))
* **deps:** update dependency googleapis to v54 ([#72](https://github.com/JustinBeckwith/gcbuild/issues/72)) ([7efee19](https://github.com/JustinBeckwith/gcbuild/commit/7efee19c9c51dba7c506d082b852cf945570de3a))
* **deps:** update dependency googleapis to v55 ([#75](https://github.com/JustinBeckwith/gcbuild/issues/75)) ([a65e843](https://github.com/JustinBeckwith/gcbuild/commit/a65e843b059965dc7b9fef2f0cd2ee905fa836e8))
* **deps:** update dependency googleapis to v56 ([#76](https://github.com/JustinBeckwith/gcbuild/issues/76)) ([232ed0a](https://github.com/JustinBeckwith/gcbuild/commit/232ed0ae1ecf421ada5f0269beee0dbdd937076b))
* **deps:** update dependency googleapis to v57 ([#77](https://github.com/JustinBeckwith/gcbuild/issues/77)) ([a75bb32](https://github.com/JustinBeckwith/gcbuild/commit/a75bb3247be7b878fde78aff4dd73b14104a6274))
* **deps:** update dependency googleapis to v58 ([#78](https://github.com/JustinBeckwith/gcbuild/issues/78)) ([d5f4a6e](https://github.com/JustinBeckwith/gcbuild/commit/d5f4a6e05a0fe484219e5dd90ea34cde3729a643))
* **deps:** update dependency googleapis to v59 ([#80](https://github.com/JustinBeckwith/gcbuild/issues/80)) ([de902d1](https://github.com/JustinBeckwith/gcbuild/commit/de902d135dd57e943d89bbeec86dddb75ec0f9af))
* **deps:** update dependency googleapis to v60 ([#82](https://github.com/JustinBeckwith/gcbuild/issues/82)) ([d0b72ad](https://github.com/JustinBeckwith/gcbuild/commit/d0b72ad6d488ba6a084c50ff1f6c84b4278edc0a))
* **deps:** update dependency googleapis to v61 ([#85](https://github.com/JustinBeckwith/gcbuild/issues/85)) ([5918f02](https://github.com/JustinBeckwith/gcbuild/commit/5918f020bd61f3336155f15c14642897b2e464ed))
* **deps:** update dependency googleapis to v62 ([#87](https://github.com/JustinBeckwith/gcbuild/issues/87)) ([274af06](https://github.com/JustinBeckwith/gcbuild/commit/274af06639fb2fe73515890fe859f0cd34e0ac9e))
* **deps:** update dependency googleapis to v63 ([#89](https://github.com/JustinBeckwith/gcbuild/issues/89)) ([614587c](https://github.com/JustinBeckwith/gcbuild/commit/614587c4f582fbec74218d10a9c76bbe85d49615))
* **deps:** update dependency googleapis to v64 ([#90](https://github.com/JustinBeckwith/gcbuild/issues/90)) ([c660d69](https://github.com/JustinBeckwith/gcbuild/commit/c660d69f5d444e219f14203c1e645215ef3527c3))
* **deps:** update dependency googleapis to v65 ([#91](https://github.com/JustinBeckwith/gcbuild/issues/91)) ([d44851c](https://github.com/JustinBeckwith/gcbuild/commit/d44851c8b949422eb31fc70eaf65533eb2731d85))
* **deps:** update dependency googleapis to v66 ([#93](https://github.com/JustinBeckwith/gcbuild/issues/93)) ([23dcb4c](https://github.com/JustinBeckwith/gcbuild/commit/23dcb4c0a71d9cf7ca14791ad366af60a33bb49b))
* **deps:** update dependency googleapis to v67 ([#97](https://github.com/JustinBeckwith/gcbuild/issues/97)) ([618c8fa](https://github.com/JustinBeckwith/gcbuild/commit/618c8fa4c956f2e492760a86b1d14fc4df98d273))
* **deps:** update dependency googleapis to v68 ([#101](https://github.com/JustinBeckwith/gcbuild/issues/101)) ([6180f99](https://github.com/JustinBeckwith/gcbuild/commit/6180f99daadb82772b64aab87b57c02f852381bf))
* **deps:** update dependency googleapis to v70 ([#102](https://github.com/JustinBeckwith/gcbuild/issues/102)) ([d0f4511](https://github.com/JustinBeckwith/gcbuild/commit/d0f45110bd2db17a27adc2cb94fd17ed642c356b))
* **deps:** update dependency googleapis to v74 ([#108](https://github.com/JustinBeckwith/gcbuild/issues/108)) ([e25130f](https://github.com/JustinBeckwith/gcbuild/commit/e25130f13999477f3963f3d00456f0117e979673))
* **deps:** update dependency googleapis to v75 ([#110](https://github.com/JustinBeckwith/gcbuild/issues/110)) ([ecfeb10](https://github.com/JustinBeckwith/gcbuild/commit/ecfeb102ca810140c7ade96de939e9e9acf9ebcc))
* **deps:** update dependency googleapis to v77 ([#113](https://github.com/JustinBeckwith/gcbuild/issues/113)) ([5cd391c](https://github.com/JustinBeckwith/gcbuild/commit/5cd391c6c5a0d83b4a903967286a13000671e2da))
* **deps:** update dependency googleapis to v78 ([#114](https://github.com/JustinBeckwith/gcbuild/issues/114)) ([4a760ae](https://github.com/JustinBeckwith/gcbuild/commit/4a760ae2b8e92465027f8207e9a18f582baeabbf))
* **deps:** update dependency googleapis to v81 ([#117](https://github.com/JustinBeckwith/gcbuild/issues/117)) ([1026a8b](https://github.com/JustinBeckwith/gcbuild/commit/1026a8b9b937ab6f1a16e1b7b6e76b9f992c97a9))
* **deps:** update dependency googleapis to v82 ([#118](https://github.com/JustinBeckwith/gcbuild/issues/118)) ([4ff9e9a](https://github.com/JustinBeckwith/gcbuild/commit/4ff9e9abe9e3be1b1d02c70281e6f046044eadbb))
* **deps:** update dependency googleapis to v84 ([#122](https://github.com/JustinBeckwith/gcbuild/issues/122)) ([0430fa6](https://github.com/JustinBeckwith/gcbuild/commit/0430fa6857429d6a265f84a9cc85bc21eaa6d2f9))
* **deps:** update dependency googleapis to v85 ([#126](https://github.com/JustinBeckwith/gcbuild/issues/126)) ([dc4d2ae](https://github.com/JustinBeckwith/gcbuild/commit/dc4d2ae2e5bf608d1d2a35d0a76c29a42d9e27fb))
* **deps:** update dependency googleapis to v89 ([#131](https://github.com/JustinBeckwith/gcbuild/issues/131)) ([0af995a](https://github.com/JustinBeckwith/gcbuild/commit/0af995ac6faaeab92080bc1cd896cd5239700f64))
* **deps:** update dependency googleapis to v91 ([#135](https://github.com/JustinBeckwith/gcbuild/issues/135)) ([d50a67b](https://github.com/JustinBeckwith/gcbuild/commit/d50a67b80da030c3241047cbc5ea59282974a556))
* **deps:** update dependency googleapis to v92 ([#138](https://github.com/JustinBeckwith/gcbuild/issues/138)) ([6cc6359](https://github.com/JustinBeckwith/gcbuild/commit/6cc6359a8786684660ade326ab4e5f152a83ce3d))
* **deps:** update dependency googleapis to v95 ([#143](https://github.com/JustinBeckwith/gcbuild/issues/143)) ([18789b4](https://github.com/JustinBeckwith/gcbuild/commit/18789b459d11290411df2965e170d48e4a321fc8))
* **deps:** update dependency googleapis to v96 ([#147](https://github.com/JustinBeckwith/gcbuild/issues/147)) ([eb81263](https://github.com/JustinBeckwith/gcbuild/commit/eb81263a61c048d9996193f60276c6d8d26f9b70))
* **deps:** update dependency googleapis to v97 ([#148](https://github.com/JustinBeckwith/gcbuild/issues/148)) ([d2424b1](https://github.com/JustinBeckwith/gcbuild/commit/d2424b128dbfeee1750db4c430d2539efadebf75))
* **deps:** update dependency googleapis to v98 ([#149](https://github.com/JustinBeckwith/gcbuild/issues/149)) ([93b38d5](https://github.com/JustinBeckwith/gcbuild/commit/93b38d50f4ac0b4478b46da7f13235cbb1808e26))
* **deps:** update dependency googleapis to v99 ([#150](https://github.com/JustinBeckwith/gcbuild/issues/150)) ([df700b3](https://github.com/JustinBeckwith/gcbuild/commit/df700b34a8dc35cbe92b8d4289a3770930d48b9a))
* **deps:** update dependency js-yaml to v4 ([#99](https://github.com/JustinBeckwith/gcbuild/issues/99)) ([4416984](https://github.com/JustinBeckwith/gcbuild/commit/44169840cdf5d551f7d683238d9baf3b51634737))
* **deps:** update dependency meow to v11 ([#169](https://github.com/JustinBeckwith/gcbuild/issues/169)) ([4d17230](https://github.com/JustinBeckwith/gcbuild/commit/4d172309120942e5ae5b7775075ef6eff24edd17))
* **deps:** update dependency meow to v12 ([#184](https://github.com/JustinBeckwith/gcbuild/issues/184)) ([0aab813](https://github.com/JustinBeckwith/gcbuild/commit/0aab8139bd5844a7349b592cff1f3ceddd96ff98))
* **deps:** update dependency meow to v13 ([#215](https://github.com/JustinBeckwith/gcbuild/issues/215)) ([2058178](https://github.com/JustinBeckwith/gcbuild/commit/2058178d337170c25ed08a2030b0eb7b06d7ebc3))
* **deps:** update dependency meow to v14 ([#273](https://github.com/JustinBeckwith/gcbuild/issues/273)) ([0c8deee](https://github.com/JustinBeckwith/gcbuild/commit/0c8deee230ca227152c207905dea637aa0f2b5dc))
* **deps:** update dependency meow to v6 ([#42](https://github.com/JustinBeckwith/gcbuild/issues/42)) ([4db29ff](https://github.com/JustinBeckwith/gcbuild/commit/4db29ff6982a25e1d9d25555b439b251a6f4ccc7))
* **deps:** update dependency meow to v7 ([#65](https://github.com/JustinBeckwith/gcbuild/issues/65)) ([2d6307c](https://github.com/JustinBeckwith/gcbuild/commit/2d6307c8b4384ea7cd5f9f3445afaa96d1aa9fd1))
* **deps:** update dependency meow to v8 ([#88](https://github.com/JustinBeckwith/gcbuild/issues/88)) ([c4e72d1](https://github.com/JustinBeckwith/gcbuild/commit/c4e72d155122c8f20bd9bcbfa17ee99a38a15f1a))
* **deps:** update dependency meow to v9 ([#96](https://github.com/JustinBeckwith/gcbuild/issues/96)) ([2c33f6a](https://github.com/JustinBeckwith/gcbuild/commit/2c33f6aaddc1d72cb623a83c0db8f23c8cc36212))
* **deps:** update dependency ora to v4 ([#35](https://github.com/JustinBeckwith/gcbuild/issues/35)) ([11868da](https://github.com/JustinBeckwith/gcbuild/commit/11868da51eb8acfa8e86036ab7492bf9cd818058))
* **deps:** update dependency ora to v5 ([#79](https://github.com/JustinBeckwith/gcbuild/issues/79)) ([6a35d28](https://github.com/JustinBeckwith/gcbuild/commit/6a35d28d4e08b199e9bb896a560bdf33ee815d68))
* **deps:** update dependency ora to v7 ([#194](https://github.com/JustinBeckwith/gcbuild/issues/194)) ([45e3fb1](https://github.com/JustinBeckwith/gcbuild/commit/45e3fb135b4ec17e533817dcfe963f0808235f4f))
* **deps:** update dependency ora to v8 ([#216](https://github.com/JustinBeckwith/gcbuild/issues/216)) ([2e8d769](https://github.com/JustinBeckwith/gcbuild/commit/2e8d76968c2b1c1f01ee33d9a3ee7316e465a616))
* **deps:** update dependency ora to v9 ([#274](https://github.com/JustinBeckwith/gcbuild/issues/274)) ([162ffe7](https://github.com/JustinBeckwith/gcbuild/commit/162ffe72a2c40709d3bf96d25906b7b472e2a1ef))
* **deps:** update dependency tar to v5 ([#36](https://github.com/JustinBeckwith/gcbuild/issues/36)) ([bc4feec](https://github.com/JustinBeckwith/gcbuild/commit/bc4feec95aabc1236328830dc4cb496eb6c4ed8d))
* **deps:** update dependency tar to v6 ([#52](https://github.com/JustinBeckwith/gcbuild/issues/52)) ([f338d11](https://github.com/JustinBeckwith/gcbuild/commit/f338d114458293c2078cc820348292fac32ed477))
* **deps:** update dependency update-notifier to v3 ([#19](https://github.com/JustinBeckwith/gcbuild/issues/19)) ([6965785](https://github.com/JustinBeckwith/gcbuild/commit/69657859866a2244070a079fbaf44805a019505a))
* **deps:** update dependency update-notifier to v4 ([#44](https://github.com/JustinBeckwith/gcbuild/issues/44)) ([3386c42](https://github.com/JustinBeckwith/gcbuild/commit/3386c42bf0b4af1434bc1877dff327395c2ca75a))
* **deps:** update dependency update-notifier to v5 ([#83](https://github.com/JustinBeckwith/gcbuild/issues/83)) ([e78eee6](https://github.com/JustinBeckwith/gcbuild/commit/e78eee6eb44bb2ea91266d0cf850982f9b8e3096))
* **deps:** update dependency update-notifier to v7 ([#210](https://github.com/JustinBeckwith/gcbuild/issues/210)) ([e497f15](https://github.com/JustinBeckwith/gcbuild/commit/e497f15698180939ea9ec3549b77933269d6b39a))
* **deps:** update to the latest update-notifier ([#167](https://github.com/JustinBeckwith/gcbuild/issues/167)) ([a3859bc](https://github.com/JustinBeckwith/gcbuild/commit/a3859bc49ac85a2140839e861afc7db87e888826))
* **deps:** upgrade to googleapis v48 ([#62](https://github.com/JustinBeckwith/gcbuild/issues/62)) ([325cb35](https://github.com/JustinBeckwith/gcbuild/commit/325cb35270ba4e32bba71602a0005152017a5780))
* **deps:** upgrade to latest googleapis package ([#280](https://github.com/JustinBeckwith/gcbuild/issues/280)) ([be5aafb](https://github.com/JustinBeckwith/gcbuild/commit/be5aafbf6fd2d9840e2937590417c6b634d4c049))
* **deps:** upgrade to the latest version of tar ([#285](https://github.com/JustinBeckwith/gcbuild/issues/285)) ([58fd498](https://github.com/JustinBeckwith/gcbuild/commit/58fd498fad61bf7c0e8f5c20c1ec0849e9f115ab))
* include logs with the error ([#6](https://github.com/JustinBeckwith/gcbuild/issues/6)) ([95c6783](https://github.com/JustinBeckwith/gcbuild/commit/95c6783d480ddd9344d95ebea2e767b5b248e975))
* pass empty params to getClient ([#31](https://github.com/JustinBeckwith/gcbuild/issues/31)) ([4177f9c](https://github.com/JustinBeckwith/gcbuild/commit/4177f9c2e49c4c05cf4a61966c7f77212104454c))
* require node 16 and up ([#182](https://github.com/JustinBeckwith/gcbuild/issues/182)) ([852f3c8](https://github.com/JustinBeckwith/gcbuild/commit/852f3c84e29f10ddc0d5df2f54cda5111af34696))


### Build System

* require Node.js 20+ ([#283](https://github.com/JustinBeckwith/gcbuild/issues/283)) ([670e2e6](https://github.com/JustinBeckwith/gcbuild/commit/670e2e68d380ef89a249d308afe1a9bb7613bdf6))
